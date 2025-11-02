import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    const { scheduleData } = await req.json();

    if (!scheduleData || !Array.isArray(scheduleData)) {
      throw new Error('Invalid schedule data format');
    }

    const eventsToInsert = scheduleData.map((event: any) => ({
      user_id: user.id,
      date: event.date,
      time_slot: event.time_slot,
      event_type: event.event_type,
      lecture_number: event.lecture_number || null,
      custom_label: event.custom_label || null,
      symbol: event.symbol || null,
      location: event.location || null,
      instructor: event.instructor || null,
      status: 'scheduled',
      notes: event.notes || null,
    }));

    const { data, error } = await supabaseClient
      .from('driving_school_schedule')
      .insert(eventsToInsert)
      .select();

    if (error) throw error;

    console.log(`Successfully imported ${data.length} schedule events for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: data.length,
        events: data 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error importing schedule:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
