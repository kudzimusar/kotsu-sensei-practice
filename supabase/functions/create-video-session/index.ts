import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { booking_id, provider = "zoom" } = await req.json();

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: "Missing booking_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*, instructors(*)')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify user has access to this booking
    if (booking.user_id !== user.id && (booking.instructors as any)?.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (booking.session_type !== 'video') {
      return new Response(
        JSON.stringify({ error: "This booking is not a video session" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate video call link based on provider
    let videoCallLink = "";
    const instructorName = (booking.instructors as any)?.full_name || "Instructor";
    const meetingDate = `${booking.scheduled_date} ${booking.scheduled_time}`;

    if (provider === "zoom") {
      // For now, generate a placeholder Zoom link
      // In production, you would use Zoom API to create actual meetings
      // This requires Zoom API credentials
      const zoomMeetingId = `zoom-${booking.id.substring(0, 8)}`;
      videoCallLink = `https://zoom.us/j/${zoomMeetingId}`;
      
      // TODO: Integrate with Zoom API
      // const zoom = new ZoomAPI(process.env.ZOOM_API_KEY, process.env.ZOOM_API_SECRET);
      // const meeting = await zoom.createMeeting({
      //   topic: `Driving Lesson with ${instructorName}`,
      //   start_time: meetingDate,
      //   duration: booking.duration_minutes,
      //   type: 2, // Scheduled meeting
      // });
      // videoCallLink = meeting.join_url;
    } else if (provider === "google_meet") {
      // Generate Google Meet link
      // In production, use Google Calendar API to create events with Meet links
      videoCallLink = `https://meet.google.com/${booking.id.substring(0, 12)}`;
    } else {
      // Custom/other providers
      videoCallLink = `https://meet.example.com/${booking.id}`;
    }

    // Update booking with video call link
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({
        video_call_link: videoCallLink,
        video_call_provider: provider,
      })
      .eq('id', booking_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        video_call_link: videoCallLink,
        provider: provider,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating video session:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create video session",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

