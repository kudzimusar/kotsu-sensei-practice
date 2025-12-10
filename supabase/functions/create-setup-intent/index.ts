import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
if (!STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(STRIPE_SECRET_KEY || "", {
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
      // Check if customer exists in Stripe by email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create new customer
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
    }

    // Validate Stripe key
    if (!STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is missing");
      return new Response(
        JSON.stringify({ error: "Stripe configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Setup Intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return new Response(
      JSON.stringify({ 
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating setup intent:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    console.error("Error stack:", error.stack);
    
    // Check for specific error types
    let errorMessage = "Failed to create setup intent";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.type) {
      errorMessage = `Stripe error: ${error.type}`;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.code || error.type || "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

