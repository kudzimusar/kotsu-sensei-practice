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

    // Get user's language preference (default to Japanese)
    const { data: settings } = await supabase
      .from('user_settings')
      .select('language')
      .eq('user_id', user.id)
      .maybeSingle();
    
    const language = settings?.language || 'ja';

    // Delete all existing schedule records for this user
    const { error: deleteError } = await supabase
      .from('driving_school_schedule')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    // English schedule labels
    const enLabels = {
      theory: (n: number) => `Lecture ${n}`,
      driving: 'AT - On-Site Driving',
      practiceTest: 'Practice Test (P)',
      orientation: 'Orientation',
      aptitude: 'Aptitude Test + Lecture 1',
      writtenTest: 'Written Test',
      drivingTest: 'Driving Test',
      completionTest: 'Stage 1 Completion Test',
      finalDriving: 'Final Driving Test',
      finalWritten: 'Final Written Test',
    };

    // Japanese schedule labels (original)
    const jaLabels = {
      theory: (n: number) => `学科${n}`,
      driving: 'AT所内',
      practiceTest: '(P)',
      orientation: 'オリエンテーション',
      aptitude: '適性 + 学科1',
      writtenTest: '筆記試験',
      drivingTest: '技能検定',
      completionTest: '修了検定',
      finalDriving: '修了検定',
      finalWritten: '終了検定',
    };

    const labels = language === 'en' ? enLabels : jaLabels;

    // Complete November & December 2025 Schedule (Official User: Kudzani Musarurwa)
    const scheduleData = [
      // November 2025
      { date: '2025-11-08', time_slot: '11:40', event_type: 'theory', lecture_number: 10, custom_label: labels.theory(10), status: 'scheduled' },
      { date: '2025-11-08', time_slot: '13:30', event_type: 'theory', lecture_number: 4, custom_label: labels.theory(4), status: 'scheduled' },
      { date: '2025-11-15', time_slot: '11:40', event_type: 'theory', lecture_number: 8, custom_label: labels.theory(8), status: 'scheduled' },
      { date: '2025-11-15', time_slot: '13:30', event_type: 'theory', lecture_number: 5, custom_label: labels.theory(5), status: 'scheduled' },
      { date: '2025-11-15', time_slot: '14:30', event_type: 'driving', lecture_number: null, custom_label: labels.driving, status: 'scheduled' },
      { date: '2025-11-22', time_slot: '17:40', event_type: 'theory', lecture_number: 9, custom_label: labels.theory(9), status: 'scheduled' },
      { date: '2025-11-23', time_slot: '13:30', event_type: 'orientation', lecture_number: null, custom_label: labels.orientation, status: 'scheduled' },
      { date: '2025-11-23', time_slot: '14:30', event_type: 'aptitude', lecture_number: 1, custom_label: labels.aptitude, status: 'scheduled' },
      { date: '2025-11-24', time_slot: '16:30', event_type: 'theory', lecture_number: 2, custom_label: labels.theory(2), status: 'scheduled' },
      { date: '2025-11-24', time_slot: '17:40', event_type: 'test', lecture_number: null, custom_label: labels.practiceTest, status: 'scheduled' },
      { date: '2025-11-29', time_slot: '16:30', event_type: 'theory', lecture_number: 3, custom_label: labels.theory(3), status: 'scheduled' },
      { date: '2025-11-29', time_slot: '17:40', event_type: 'driving', lecture_number: null, custom_label: labels.driving, status: 'scheduled' },
      { date: '2025-11-30', time_slot: '14:30', event_type: 'theory', lecture_number: 7, custom_label: labels.theory(7), status: 'scheduled' },
      { date: '2025-11-30', time_slot: '15:30', event_type: 'test', lecture_number: null, custom_label: labels.practiceTest, status: 'scheduled' },
      { date: '2025-11-30', time_slot: '16:30', event_type: 'theory', lecture_number: 6, custom_label: labels.theory(6), status: 'scheduled' },
      
      // December 2025
      { date: '2025-12-06', time_slot: '11:40', event_type: 'theory', lecture_number: null, custom_label: labels.theory(6), status: 'scheduled' },
      { date: '2025-12-06', time_slot: '13:30', event_type: 'driving', lecture_number: null, custom_label: labels.driving, status: 'scheduled' },
      { date: '2025-12-07', time_slot: '12:30', event_type: 'driving', lecture_number: null, custom_label: labels.driving, status: 'scheduled' },
      { date: '2025-12-07', time_slot: '14:30', event_type: 'test', lecture_number: null, custom_label: labels.practiceTest, status: 'scheduled' },
      { date: '2025-12-13', time_slot: '15:30', event_type: 'driving', lecture_number: null, custom_label: labels.driving, status: 'scheduled' },
      { date: '2025-12-13', time_slot: '16:30', event_type: 'test', lecture_number: null, custom_label: labels.practiceTest, status: 'scheduled' },
      { date: '2025-12-14', time_slot: '13:30', event_type: 'driving', lecture_number: null, custom_label: labels.driving, status: 'scheduled' },
      { date: '2025-12-20', time_slot: '15:30', event_type: 'test', lecture_number: null, custom_label: labels.practiceTest, status: 'scheduled' },
      { date: '2025-12-20', time_slot: '16:30', event_type: 'theory', lecture_number: 2, custom_label: labels.theory(2), status: 'scheduled' },
      { date: '2025-12-20', time_slot: '17:40', event_type: 'driving', lecture_number: null, custom_label: labels.driving, status: 'scheduled' },
      { date: '2025-12-27', time_slot: '16:30', event_type: 'driving', lecture_number: null, custom_label: labels.driving, status: 'scheduled' },
      { date: '2025-12-27', time_slot: '17:30', event_type: 'test', lecture_number: null, custom_label: labels.practiceTest, status: 'scheduled' },
      { date: '2025-12-27', time_slot: '18:40', event_type: 'test', lecture_number: null, custom_label: labels.practiceTest, status: 'scheduled' },
      { date: '2025-12-28', time_slot: '11:40', event_type: 'test', lecture_number: null, custom_label: labels.finalDriving, status: 'scheduled' },
      { date: '2025-12-28', time_slot: '13:30', event_type: 'driving', lecture_number: null, custom_label: labels.driving, status: 'scheduled' },
      { date: '2025-12-28', time_slot: '14:30', event_type: 'test', lecture_number: null, custom_label: labels.writtenTest, status: 'scheduled' },
      { date: '2025-12-28', time_slot: '15:30', event_type: 'test', lecture_number: null, custom_label: labels.finalWritten, status: 'scheduled' },
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
      JSON.stringify({ success: true, events: data?.length || 0, language }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
