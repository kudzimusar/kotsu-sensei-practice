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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { productId, referralCode } = await req.json();

    if (!productId) {
      throw new Error('Product ID is required');
    }

    console.log('Tracking affiliate click for product:', productId);

    // Get user if authenticated
    const authHeader = req.headers.get('Authorization');
    let userId = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      userId = user?.id;
    }

    // Get IP and user agent for tracking
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Track the click
    const { data: click, error: clickError } = await supabase
      .from('affiliate_clicks')
      .insert({
        user_id: userId,
        product_id: productId,
        referral_code: referralCode,
        ip_address: ipAddress,
        user_agent: userAgent,
        converted: false
      })
      .select()
      .single();

    if (clickError) {
      console.error('Error tracking click:', clickError);
      throw clickError;
    }

    console.log('Successfully tracked click:', click.id);

    // Get the affiliate product details
    const { data: product, error: productError } = await supabase
      .from('affiliate_products')
      .select('affiliate_url')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('Error fetching product:', productError);
      throw new Error('Product not found');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        clickId: click.id,
        redirectUrl: product.affiliate_url 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-affiliate-click:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
