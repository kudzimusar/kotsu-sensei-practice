import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get session_id from request
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Retrieve Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer', 'line_items'],
    });

    // Verify the session belongs to this user
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;

    if (customerId) {
      // Check if customer belongs to user
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

      if (profile?.stripe_customer_id !== customerId) {
        return new Response(
          JSON.stringify({ error: "Session does not belong to this user" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Format session data for frontend
    const lineItem = session.line_items?.data[0];
    const subscription = typeof session.subscription === 'object' 
      ? session.subscription 
      : session.subscription 
        ? await stripe.subscriptions.retrieve(session.subscription as string)
        : null;

    // Extract plan type from metadata or subscription
    const planType = session.metadata?.plan_type || 
                    subscription?.metadata?.plan_type || 
                    'monthly';

    // Calculate trial end date
    let trialEnd: string | null = null;
    let trialStart: string | null = null;
    if (subscription?.trial_end) {
      trialEnd = new Date(subscription.trial_end * 1000).toISOString();
    }
    if (subscription?.trial_start) {
      trialStart = new Date(subscription.trial_start * 1000).toISOString();
    }

    // Get next payment date
    let nextPaymentDate: string | null = null;
    if (subscription?.current_period_end) {
      nextPaymentDate = new Date(subscription.current_period_end * 1000).toISOString();
    }

    // Get amount (from line item or subscription)
    let amount: number | null = null;
    if (lineItem?.amount_total) {
      amount = lineItem.amount_total;
    } else if (subscription?.items?.data[0]?.price?.unit_amount) {
      amount = subscription.items.data[0].price.unit_amount;
    }

    // Format response
    const response = {
      session_id: session.id,
      plan_type: planType,
      amount: amount,
      currency: session.currency || 'jpy',
      status: session.payment_status,
      trial_start: trialStart,
      trial_end: trialEnd,
      next_payment_date: nextPaymentDate,
      subscription_id: subscription?.id || null,
      customer_id: customerId,
      created: session.created,
      mode: session.mode,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to retrieve session" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

