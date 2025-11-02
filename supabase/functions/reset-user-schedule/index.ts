import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete all existing schedule records for this user
    const { error: deleteError } = await supabase
      .from('driving_school_schedule')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    // Insert correct schedule data from Japanese schedule
    const scheduleData = [
      // November 2025 (15 events)
      { date: '2025-11-02', time_slot: '14:50', event_type: 'orientation', lecture_number: null, custom_label: 'Orientation', status: 'scheduled' },
      { date: '2025-11-08', time_slot: '11:40', event_type: 'theory', lecture_number: 10, custom_label: '学科10', status: 'scheduled' },
      { date: '2025-11-08', time_slot: '13:30', event_type: 'theory', lecture_number: 4, custom_label: '学科4', status: 'scheduled' },
      { date: '2025-11-15', time_slot: '11:40', event_type: 'theory', lecture_number: 8, custom_label: '学科8', status: 'scheduled' },
      { date: '2025-11-15', time_slot: '13:30', event_type: 'theory', lecture_number: 5, custom_label: '学科5', status: 'scheduled' },
      { date: '2025-11-15', time_slot: '14:30', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      { date: '2025-11-22', time_slot: '18:40', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      { date: '2025-11-23', time_slot: '13:30', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      { date: '2025-11-23', time_slot: '14:30', event_type: 'theory', lecture_number: 9, custom_label: '学科9', status: 'scheduled' },
      { date: '2025-11-24', time_slot: '16:30', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      { date: '2025-11-24', time_slot: '18:40', event_type: 'theory', lecture_number: 3, custom_label: '学科3', status: 'scheduled' },
      { date: '2025-11-29', time_slot: '16:30', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      { date: '2025-11-30', time_slot: '14:30', event_type: 'theory', lecture_number: 7, custom_label: '学科7', status: 'scheduled' },
      { date: '2025-11-30', time_slot: '15:30', event_type: 'test', lecture_number: null, custom_label: '(P)', status: 'scheduled' },
      { date: '2025-11-30', time_slot: '16:30', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      // December 2025 (17 events)
      { date: '2025-12-06', time_slot: '11:40', event_type: 'theory', lecture_number: 6, custom_label: '学科6', status: 'scheduled' },
      { date: '2025-12-06', time_slot: '14:30', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      { date: '2025-12-07', time_slot: '13:30', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      { date: '2025-12-07', time_slot: '15:30', event_type: 'test', lecture_number: null, custom_label: '(P)', status: 'scheduled' },
      { date: '2025-12-13', time_slot: '15:30', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      { date: '2025-12-13', time_slot: '16:30', event_type: 'test', lecture_number: null, custom_label: '(P)', status: 'scheduled' },
      { date: '2025-12-14', time_slot: '13:30', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      { date: '2025-12-20', time_slot: '15:30', event_type: 'test', lecture_number: null, custom_label: '(P)', status: 'scheduled' },
      { date: '2025-12-20', time_slot: '16:30', event_type: 'theory', lecture_number: 2, custom_label: '学科2', status: 'scheduled' },
      { date: '2025-12-20', time_slot: '18:40', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      { date: '2025-12-27', time_slot: '16:30', event_type: 'driving', lecture_number: null, custom_label: 'AT所内', status: 'scheduled' },
      { date: '2025-12-27', time_slot: '17:40', event_type: 'test', lecture_number: null, custom_label: '(P)', status: 'scheduled' },
      { date: '2025-12-27', time_slot: '18:40', event_type: 'test', lecture_number: null, custom_label: '(P)', status: 'scheduled' },
      { date: '2025-12-28', time_slot: '10:40', event_type: 'test', lecture_number: null, custom_label: '修了検定', status: 'scheduled' },
      { date: '2025-12-28', time_slot: '13:30', event_type: 'driving', lecture_number: null, custom_label: 'Driving/Written', status: 'scheduled' },
      { date: '2025-12-28', time_slot: '14:30', event_type: 'test', lecture_number: null, custom_label: 'Written Test', status: 'scheduled' },
      { date: '2025-12-28', time_slot: '15:30', event_type: 'test', lecture_number: null, custom_label: '終了検定', status: 'scheduled' },
    ];

    const eventsWithUser = scheduleData.map(event => ({
      ...event,
      user_id: user.id,
    }));

    const { data, error: insertError } = await supabase
      .from('driving_school_schedule')
      .insert(eventsWithUser)
      .select();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, events: data?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
