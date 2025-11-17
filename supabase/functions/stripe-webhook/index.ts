import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabaseClient, session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabaseClient, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabaseClient, subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(supabaseClient, invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabaseClient, invoice);
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleTrialWillEnd(supabaseClient, subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleCheckoutCompleted(
  supabase: any,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  const planType = session.metadata?.plan_type;
  const bookingId = session.metadata?.booking_id;

    // Handle booking payments
  if (bookingId) {
    await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .eq("user_id", userId);

    console.log("Booking payment completed:", bookingId);

    // Send confirmation notification
    try {
      await supabase.functions.invoke("send-booking-notifications", {
        body: {
          booking_id: bookingId,
          notification_type: "booking_confirmed",
        },
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    return;
  }

  // Handle subscription payments
  if (!userId || !planType) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // For one-time payments (lifetime), create subscription record
  if (session.mode === "payment") {
    await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan_type: planType,
      status: "active",
      stripe_subscription_id: session.id, // Use session ID for lifetime
      stripe_customer_id: session.customer as string,
      current_period_start: new Date().toISOString(),
      current_period_end: null, // Lifetime has no end date
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  // For subscriptions, the subscription.created event will handle it
}

async function handleSubscriptionUpdate(
  supabase: any,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  // Get user ID from customer metadata or subscription metadata
  let userId: string | null = null;

  if (subscription.metadata?.user_id) {
    userId = subscription.metadata.user_id;
  } else {
    // Try to find user by customer ID
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (existingSub) {
      userId = existingSub.user_id;
    } else {
      // Get customer to find user ID
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted && customer.metadata?.supabase_user_id) {
        userId = customer.metadata.supabase_user_id;
      }
    }
  }

  if (!userId) {
    console.error("Could not find user ID for subscription:", subscription.id);
    return;
  }

  // Determine plan type from subscription
  const planType = subscription.metadata?.plan_type || "monthly";

  // Determine status
  let status = "active";
  if (subscription.status === "canceled") {
    status = "canceled";
  } else if (subscription.status === "past_due" || subscription.status === "unpaid") {
    status = "past_due";
  } else if (subscription.status === "trialing") {
    status = "trialing";
  } else if (subscription.status === "incomplete" || subscription.status === "incomplete_expired") {
    status = subscription.status;
  }

  await supabase.from("subscriptions").upsert({
    user_id: userId,
    plan_type: planType,
    status: status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    stripe_price_id: subscription.items.data[0]?.price.id,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: "user_id,stripe_subscription_id",
  });
}

async function handleSubscriptionDeleted(
  supabase: any,
  subscription: Stripe.Subscription
) {
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handlePaymentSucceeded(
  supabase: any,
  invoice: Stripe.Invoice
) {
  // Payment succeeded - subscription should already be updated
  // This is mainly for logging/notifications
  console.log("Payment succeeded for invoice:", invoice.id);
}

async function handlePaymentFailed(
  supabase: any,
  invoice: Stripe.Invoice
) {
  const subscriptionId = invoice.subscription as string;

  if (subscriptionId) {
    await supabase
      .from("subscriptions")
      .update({
        status: "past_due",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);
  }

  // TODO: Send notification to user about failed payment
}

async function handleTrialWillEnd(
  supabase: any,
  subscription: Stripe.Subscription
) {
  // TODO: Send notification to user that trial is ending
  console.log("Trial will end for subscription:", subscription.id);
}

