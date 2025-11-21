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

serve(async (req) => {
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

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { booking_id, success_url, cancel_url, payment_method } = await req.json();

    if (!booking_id || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*, instructors(*)')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (booking.payment_status === 'paid') {
      return new Response(
        JSON.stringify({ error: "Booking already paid" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get or create Stripe customer
    let customerId: string;
    const { data: existingSubscription } = await supabaseClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
    } else {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;
    }

    // Determine payment method types
    const selectedPaymentMethod = payment_method || "card";
    let paymentMethodTypes: string[] = ["card"];
    let paymentMethodOptions: any = {};

    if (selectedPaymentMethod === "paypal") {
      paymentMethodTypes = ["card", "paypal"];
      paymentMethodOptions = {
        paypal: {
          preferred_locale: "ja-JP",
        },
      };
    } else if (selectedPaymentMethod === "paypay") {
      paymentMethodTypes = ["paypay"];
    } else if (selectedPaymentMethod === "konbini") {
      paymentMethodTypes = ["customer_balance"];
      paymentMethodOptions = {
        customer_balance: {
          funding_type: "bank_transfer",
          bank_transfer: {
            type: "jp_bank_transfer",
          },
        },
      };
    }

    // Get instructor name
    const instructorName = (booking.instructors as any)?.full_name || "Instructor";

    const { payment_method_id } = await req.json();
    
    // Create Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: paymentMethodTypes as any,
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: `Driving Lesson with ${instructorName}`,
              description: `${booking.duration_minutes}-minute ${booking.session_type} session on ${booking.scheduled_date} at ${booking.scheduled_time}`,
            },
            unit_amount: booking.price_yen, // JPY uses smallest unit (no decimals)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: success_url,
      cancel_url: cancel_url,
      payment_method_collection: payment_method_id ? "if_required" : "always",
      payment_method: payment_method_id || undefined,
      metadata: {
        user_id: user.id,
        booking_id: booking_id,
        payment_method: selectedPaymentMethod,
      },
      allow_promotion_codes: true,
    };

    if (Object.keys(paymentMethodOptions).length > 0) {
      sessionParams.payment_method_options = paymentMethodOptions;
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (error: any) {
      // Fallback to card if payment method fails
      if (error.code === "payment_method_not_available" || 
          error.type === "invalid_request_error" ||
          error.message?.includes("payment method")) {
        console.log("Payment method not available, falling back to card");
        sessionParams.payment_method_types = ["card"];
        delete sessionParams.payment_method_options;
        session = await stripe.checkout.sessions.create(sessionParams);
      } else {
        throw error;
      }
    }

    // Update booking with payment intent ID
    await supabaseClient
      .from('bookings')
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', booking_id);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url,
        paymentMethod: selectedPaymentMethod,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating booking payment:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to create payment session",
        details: error.code || error.type,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

