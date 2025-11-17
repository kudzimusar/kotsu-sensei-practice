import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

/**
 * Check which payment methods are available for the account
 * This function checks account country and capabilities
 */
async function getAvailablePaymentMethods(currency: string = "jpy"): Promise<string[]> {
  const availableMethods: string[] = ["card"]; // Card is always available
  
  // Try to check account capabilities
  try {
    const account = await stripe.accounts.retrieve();
    
    // Check if account is in Japan (required for PayPay and Konbini)
    const isJapanAccount = account.country === "JP";
    
    // For PayPal, it's usually available in most regions
    // We'll try to include it and let Stripe handle the error if not available
    availableMethods.push("paypal");
    
    if (isJapanAccount) {
      // PayPay and Konbini are Japan-only
      availableMethods.push("paypay");
      // Konbini uses customer_balance with bank_transfer
      // We'll handle this separately in the checkout creation
    }
  } catch (error) {
    console.log("Could not retrieve account info, using defaults:", error);
    // If we can't retrieve account, assume PayPal is available
    availableMethods.push("paypal");
  }
  
  return availableMethods;
}

/**
 * Get the best available payment methods for the selected method
 * Falls back to card if the requested method isn't available
 */
async function getPaymentMethodTypes(
  requestedMethod: string,
  currency: string = "jpy"
): Promise<{ types: string[]; options?: any; fallback?: boolean }> {
  const availableMethods = await getAvailablePaymentMethods(currency);
  
  // Always include card as fallback
  const result: { types: string[]; options?: any; fallback?: boolean } = {
    types: ["card"],
  };
  
  switch (requestedMethod) {
    case "paypal":
      if (availableMethods.includes("paypal")) {
        result.types = ["card", "paypal"];
        result.options = {
          paypal: {
            preferred_locale: "ja-JP",
          },
        };
      } else {
        result.fallback = true;
        console.log("PayPal not available, falling back to card");
      }
      break;
      
    case "paypay":
      if (availableMethods.includes("paypay")) {
        result.types = ["paypay"];
      } else {
        result.fallback = true;
        console.log("PayPay not available, falling back to card");
      }
      break;
      
    case "konbini":
      // Konbini uses customer_balance with bank_transfer
      // Only available for one-time payments in Japan
      result.types = ["customer_balance"];
      result.options = {
        customer_balance: {
          funding_type: "bank_transfer",
          bank_transfer: {
            type: "jp_bank_transfer",
          },
        },
      };
      break;
      
    default:
      // Card is the default
      result.types = ["card"];
  }
  
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the user from the auth token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { plan_type, success_url, cancel_url, payment_method } = await req.json();

    // Log URLs for debugging (remove sensitive data in production)
    console.log('Received checkout request:', {
      plan_type,
      success_url,
      cancel_url: cancel_url?.substring(0, 50) + '...',
      payment_method,
    });

    if (!plan_type || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate payment method
    const validPaymentMethods = ["card", "paypal", "paypay", "konbini"];
    const selectedPaymentMethod = payment_method || "card";
    
    if (!validPaymentMethods.includes(selectedPaymentMethod)) {
      return new Response(
        JSON.stringify({ error: "Invalid payment method" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate plan type
    const validPlanTypes = ["monthly", "quarterly", "annual", "lifetime"];
    if (!validPlanTypes.includes(plan_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid plan type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check for existing active subscription FIRST - prevent duplicates
    const { data: existingActiveSubscription } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    // Prevent duplicate active subscriptions
    if (existingActiveSubscription) {
      console.log("User already has active subscription:", existingActiveSubscription.id);
      return new Response(
        JSON.stringify({ 
          error: "You already have an active subscription. Please manage it from your account page or upgrade to a different plan.",
          existingSubscription: {
            plan_type: existingActiveSubscription.plan_type,
            status: existingActiveSubscription.status,
            current_period_end: existingActiveSubscription.current_period_end,
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get or create Stripe customer
    let customerId: string;

    // Check if user already has a Stripe customer ID (from any subscription, including trialing)
    const { data: existingSubscription } = await supabaseClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
    } else {
      // Get user email for Stripe customer
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;
    }

    // Define pricing based on plan type
    // CRITICAL FIX: JPY amounts were 100x too high
    // JPY uses 1 yen = 1 unit (no decimals), so:
    // - ¥980 = 980 (not 98000)
    // - ¥1,500 = 1500 (not 150000)
    // - ¥2,400 = 2400 (not 240000)
    // - ¥8,800 = 8800 (not 880000)
    const pricing = {
      monthly: {
        amount: 980, // ¥980 in yen (Stripe uses smallest currency unit, JPY has no decimals)
        currency: "jpy",
        interval: "month",
        priceId: Deno.env.get("STRIPE_PRICE_ID_MONTHLY") || "",
      },
      quarterly: {
        amount: 1500, // ¥1,500 in yen (Stripe uses smallest currency unit, JPY has no decimals)
        currency: "jpy",
        interval: "month",
        interval_count: 3,
        priceId: Deno.env.get("STRIPE_PRICE_ID_QUARTERLY") || "",
      },
      annual: {
        amount: 8800, // ¥8,800 in yen (Stripe uses smallest currency unit, JPY has no decimals)
        currency: "jpy",
        interval: "year",
        priceId: Deno.env.get("STRIPE_PRICE_ID_ANNUAL") || "",
      },
      lifetime: {
        amount: 2400, // ¥2,400 in yen (one-time payment for 9 months, JPY has no decimals)
        currency: "jpy",
        priceId: Deno.env.get("STRIPE_PRICE_ID_LIFETIME") || "",
      },
    };

    const plan = pricing[plan_type as keyof typeof pricing];

    // Get payment method types dynamically
    const paymentConfig = await getPaymentMethodTypes(selectedPaymentMethod, plan.currency);
    
    // Warn if fallback was used
    if (paymentConfig.fallback) {
      console.warn(`Payment method ${selectedPaymentMethod} not available, using card instead`);
    }

    // Create Stripe Checkout Session
    let session;

    if (plan_type === "lifetime") {
      // One-time payment for lifetime
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        payment_method_types: paymentConfig.types as any,
        line_items: [
          {
            price_data: {
              currency: plan.currency,
              product_data: {
                name: "Kōtsū Sensei Premium - 9-Month Access",
                description: "9 months access to all premium features (standard driving license period)",
              },
              // CRITICAL FIX: Amount corrected (was 100x too high)
              // JPY: 1 yen = 1 unit (no decimals), so 2400 = ¥2,400 ✅
              unit_amount: plan.amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: success_url,
        cancel_url: cancel_url,
        // Allow users to enter payment details instead of using saved card
        payment_method_collection: "always", // Always show payment form, don't auto-fill saved payment methods
        metadata: {
          user_id: user.id,
          plan_type: plan_type,
          payment_method: selectedPaymentMethod,
          actual_payment_method: paymentConfig.fallback ? "card" : selectedPaymentMethod,
        },
        allow_promotion_codes: true,
      };

      // Add payment method options if provided
      if (paymentConfig.options) {
        sessionParams.payment_method_options = paymentConfig.options;
      }

      try {
        session = await stripe.checkout.sessions.create(sessionParams);
      } catch (error: any) {
        // If payment method fails, try with card only
        if (error.code === "payment_method_not_available" || 
            error.type === "invalid_request_error" ||
            error.message?.includes("payment method")) {
          console.log("Payment method not available, falling back to card");
          sessionParams.payment_method_types = ["card"];
          delete sessionParams.payment_method_options;
          session = await stripe.checkout.sessions.create(sessionParams);
          paymentConfig.fallback = true;
        } else {
          throw error;
        }
      }
    } else {
      // Recurring subscription
      // Konbini is not available for subscriptions
      if (selectedPaymentMethod === "konbini") {
        return new Response(
          JSON.stringify({ 
            error: "Konbini is only available for one-time payments. Please select Lifetime plan or choose another payment method." 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // CRITICAL FIX: Always use price_data to ensure correct pricing
      // Price IDs are disabled to prevent wrong prices (e.g., ¥150,000 instead of ¥1,500)
      // This ensures we always use the correct amounts defined in the pricing object
      const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
        price_data: {
          currency: plan.currency,
          product_data: {
            name: `Kōtsū Sensei Premium - ${plan_type.charAt(0).toUpperCase() + plan_type.slice(1)}`,
            description: `Premium subscription (${plan_type})`,
          },
          recurring: {
            interval: (("interval" in plan ? plan.interval : "month") || "month") as "month" | "year",
            interval_count: ("interval_count" in plan ? plan.interval_count : 1) || 1,
          },
          // CRITICAL FIX: Amounts corrected (were 100x too high)
          // JPY: 1 yen = 1 unit (no decimals), so:
          // - 1500 = ¥1,500 (Quarterly) ✅
          // - 2400 = ¥2,400 (9-Month) ✅
          // - 980 = ¥980 (Monthly) ✅
          // - 8800 = ¥8,800 (Annual) ✅
          unit_amount: plan.amount,
        },
        quantity: 1,
      };

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        payment_method_types: paymentConfig.types as any,
        line_items: [lineItem],
        mode: "subscription",
        success_url: success_url,
        cancel_url: cancel_url,
        // Allow users to enter payment details instead of using saved card
        payment_method_collection: "always", // Always show payment form, don't auto-fill saved payment methods
        subscription_data: {
          trial_period_days: 7, // 7-day free trial
          metadata: {
            user_id: user.id,
            plan_type: plan_type,
            payment_method: selectedPaymentMethod,
            actual_payment_method: paymentConfig.fallback ? "card" : selectedPaymentMethod,
          },
        },
        metadata: {
          user_id: user.id,
          plan_type: plan_type,
          payment_method: selectedPaymentMethod,
          actual_payment_method: paymentConfig.fallback ? "card" : selectedPaymentMethod,
        },
        allow_promotion_codes: true,
      };

      // Add payment method options if provided
      if (paymentConfig.options) {
        sessionParams.payment_method_options = paymentConfig.options;
      }

      try {
        session = await stripe.checkout.sessions.create(sessionParams);
      } catch (error: any) {
        // If payment method fails, try with card only
        if (error.code === "payment_method_not_available" || 
            error.type === "invalid_request_error" ||
            error.message?.includes("payment method")) {
          console.log("Payment method not available, falling back to card");
          sessionParams.payment_method_types = ["card"];
          delete sessionParams.payment_method_options;
          session = await stripe.checkout.sessions.create(sessionParams);
          paymentConfig.fallback = true;
        } else {
          throw error;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url,
        paymentMethod: paymentConfig.fallback ? "card" : selectedPaymentMethod,
        fallbackUsed: paymentConfig.fallback || false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to create checkout session",
        details: error.code || error.type,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
