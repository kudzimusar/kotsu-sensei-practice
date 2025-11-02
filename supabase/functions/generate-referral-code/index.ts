import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Generating referral code for user:', user.id);

    // Check if user already has an active referral code
    const { data: existingReferral, error: fetchError } = await supabase
      .from('user_referrals')
      .select('*')
      .eq('referrer_user_id', user.id)
      .is('referred_user_id', null)
      .eq('status', 'pending')
      .single();

    if (existingReferral) {
      console.log('User already has an active referral code:', existingReferral.referral_code);
      return new Response(
        JSON.stringify({ referralCode: existingReferral.referral_code, existing: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a unique referral code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let referralCode = generateCode();
    let attempts = 0;
    let isUnique = false;

    // Try to find a unique code (max 10 attempts)
    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabase
        .from('user_referrals')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (!existing) {
        isUnique = true;
      } else {
        referralCode = generateCode();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Could not generate unique referral code');
    }

    // Create new referral code
    const { data: newReferral, error: insertError } = await supabase
      .from('user_referrals')
      .insert({
        referrer_user_id: user.id,
        referral_code: referralCode,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating referral:', insertError);
      throw insertError;
    }

    console.log('Created new referral code:', referralCode);

    return new Response(
      JSON.stringify({ referralCode, existing: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-referral-code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
