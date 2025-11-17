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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { booking_id, notification_type } = await req.json();

    if (!booking_id || !notification_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get booking with related data
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        profiles!bookings_user_id_fkey(full_name, id),
        instructors!bookings_instructor_id_fkey(full_name, email, id)
      `)
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

    const student = (booking.profiles as any);
    const instructor = (booking.instructors as any);

    // Get user emails
    const { data: studentUser } = await supabaseClient.auth.admin.getUserById(booking.user_id);
    const { data: instructorUser } = await supabaseClient.auth.admin.getUserById(instructor.id);

    const studentEmail = studentUser?.user?.email;
    const instructorEmail = instructorUser?.user?.email;

    // Prepare email content based on notification type
    let subject = "";
    let studentBody = "";
    let instructorBody = "";

    switch (notification_type) {
      case "booking_confirmed":
        subject = "Booking Confirmed - Kōtsū Sensei";
        studentBody = `
          Hello ${student?.full_name || "Student"},
          
          Your booking with ${instructor.full_name} has been confirmed!
          
          Session Details:
          - Date: ${booking.scheduled_date}
          - Time: ${booking.scheduled_time}
          - Duration: ${booking.duration_minutes} minutes
          - Type: ${booking.session_type}
          - Price: ¥${booking.price_yen.toLocaleString()}
          
          ${booking.video_call_link ? `Video Call Link: ${booking.video_call_link}` : ''}
          
          We look forward to your session!
        `;
        instructorBody = `
          Hello ${instructor.full_name},
          
          You have a new confirmed booking!
          
          Student: ${student?.full_name || "Student"}
          Date: ${booking.scheduled_date}
          Time: ${booking.scheduled_time}
          Duration: ${booking.duration_minutes} minutes
          Type: ${booking.session_type}
        `;
        break;

      case "booking_reminder_24h":
        subject = "Reminder: Your Session is Tomorrow - Kōtsū Sensei";
        studentBody = `
          Hello ${student?.full_name || "Student"},
          
          This is a reminder that your session with ${instructor.full_name} is tomorrow!
          
          Date: ${booking.scheduled_date}
          Time: ${booking.scheduled_time}
          Duration: ${booking.duration_minutes} minutes
          
          ${booking.video_call_link ? `Video Call Link: ${booking.video_call_link}` : ''}
          
          See you soon!
        `;
        break;

      case "booking_reminder_1h":
        subject = "Reminder: Your Session Starts in 1 Hour - Kōtsū Sensei";
        studentBody = `
          Hello ${student?.full_name || "Student"},
          
          Your session with ${instructor.full_name} starts in 1 hour!
          
          Time: ${booking.scheduled_time}
          
          ${booking.video_call_link ? `Video Call Link: ${booking.video_call_link}` : ''}
          
          We'll see you soon!
        `;
        break;

      case "booking_cancelled":
        subject = "Booking Cancelled - Kōtsū Sensei";
        studentBody = `
          Hello ${student?.full_name || "Student"},
          
          Your booking with ${instructor.full_name} has been cancelled.
          
          ${booking.cancellation_reason ? `Reason: ${booking.cancellation_reason}` : ''}
          
          ${booking.refund_amount ? `Refund Amount: ¥${booking.refund_amount.toLocaleString()}` : ''}
        `;
        instructorBody = `
          Hello ${instructor.full_name},
          
          A booking has been cancelled.
          
          Student: ${student?.full_name || "Student"}
          Date: ${booking.scheduled_date}
          Time: ${booking.scheduled_time}
        `;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid notification type" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    // Send emails using Supabase's built-in email (or integrate with SendGrid, Resend, etc.)
    // For now, we'll log the emails. In production, integrate with an email service.
    console.log("Email to student:", {
      to: studentEmail,
      subject,
      body: studentBody,
    });

    console.log("Email to instructor:", {
      to: instructorEmail,
      subject,
      body: instructorBody,
    });

    // TODO: Integrate with email service (SendGrid, Resend, AWS SES, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'noreply@kotsu-sensei.com',
    //   to: studentEmail,
    //   subject,
    //   html: studentBody,
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notifications queued",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending notifications:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send notifications",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

