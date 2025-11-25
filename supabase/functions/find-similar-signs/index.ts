import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { category, tags, signName, limit = 10 } = await req.json();

    if (!category && !tags && !signName) {
      return new Response(
        JSON.stringify({ error: 'At least one search parameter (category, tags, or signName) is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let query = supabase
      .from('road_sign_images')
      .select('*')
      .eq('is_verified', true) // Only return verified signs by default
      .order('usage_count', { ascending: false }) // Most used first
      .limit(limit);

    // Filter by category
    if (category) {
      query = query.eq('sign_category', category);
    }

    // Filter by tags (using array overlap)
    if (tags && Array.isArray(tags) && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // Filter by sign name (fuzzy match using ILIKE)
    if (signName) {
      query = query.or(`sign_name_en.ilike.%${signName}%,sign_name_jp.ilike.%${signName}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to search for similar signs', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Increment usage count for returned images
    if (data && data.length > 0) {
      const updatePromises = data.map((img: any) => 
        supabase
          .from('road_sign_images')
          .update({ usage_count: (img.usage_count || 0) + 1 })
          .eq('id', img.id)
      );
      await Promise.all(updatePromises);
    }

    return new Response(
      JSON.stringify({
        success: true,
        images: data || [],
        count: data?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in find-similar-signs:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

