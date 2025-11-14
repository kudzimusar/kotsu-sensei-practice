import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    // Get account information
    const account = await stripe.accounts.retrieve();
    const isJapanAccount = account.country === "JP";

    // Available payment methods
    const availableMethods: {
      method: string;
      available: boolean;
      reason?: string;
    }[] = [
      {
        method: "card",
        available: true, // Always available
      },
      {
        method: "paypal",
        available: true, // Usually available in most regions
      },
      {
        method: "paypay",
        available: isJapanAccount,
        reason: isJapanAccount ? undefined : "Requires Japan-based Stripe account",
      },
      {
        method: "konbini",
        available: isJapanAccount,
        reason: isJapanAccount ? undefined : "Requires Japan-based Stripe account",
      },
    ];

    return new Response(
      JSON.stringify({
        accountCountry: account.country,
        isJapanAccount,
        availableMethods: availableMethods.filter(m => m.available).map(m => m.method),
        allMethods: availableMethods,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error checking payment methods:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to check payment methods",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

