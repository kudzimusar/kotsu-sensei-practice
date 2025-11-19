import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { practice_room_id, participant_id, payment_method, success_url, cancel_url } = await req.json();

    if (!practice_room_id || !participant_id) {
      throw new Error('practice_room_id and participant_id are required');
    }

    // Get practice room and participant details
    const { data: room, error: roomError } = await supabaseClient
      .from('practice_rooms')
      .select('*')
      .eq('id', practice_room_id)
      .single();

    if (roomError || !room) {
      throw new Error('Practice room not found');
    }

    const { data: participant, error: participantError } = await supabaseClient
      .from('practice_room_participants')
      .select('*')
      .eq('id', participant_id)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      throw new Error('Participant record not found');
    }

    if (participant.payment_status === 'paid') {
      throw new Error('Payment already completed');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: payment_method === 'card' ? ['card'] : payment_method === 'paypal' ? ['paypal'] : [],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: room.title,
              description: `Practice room session - ${room.duration_minutes} minutes`,
            },
            unit_amount: room.price_per_participant_yen,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${req.headers.get('origin')}/practice-room/${practice_room_id}/success`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/practice-room/${practice_room_id}/payment`,
      metadata: {
        practice_room_id,
        participant_id,
        user_id: user.id,
        type: 'practice_room_payment',
      },
      customer_email: user.email,
    });

    // Update participant with payment intent ID
    await supabaseClient
      .from('practice_room_participants')
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', participant_id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating practice room payment:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

