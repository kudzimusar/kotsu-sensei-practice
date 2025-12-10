import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Booking = Tables<"bookings">;

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }

  return data;
}

export async function getUserBookings(userId?: string): Promise<Booking[]> {
  let effectiveUserId = userId;
  
  if (!effectiveUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    effectiveUserId = user.id;
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", effectiveUserId)
    .order("scheduled_date", { ascending: false });

  if (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }

  return data || [];
}

export async function cancelBooking(bookingId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
}

export interface CreateBookingData {
  instructor_id: string;
  session_type: 'video' | 'in_person';
  duration_minutes: 30 | 60 | 90;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM
  timezone?: string;
  student_notes?: string;
  price_yen: number;
}

export async function createBooking(data: CreateBookingData): Promise<Booking> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  // Verify instructor is available using the database function
  const { data: isAvailable, error: availabilityError } = await supabase
    .rpc('is_instructor_available', {
      p_instructor_id: data.instructor_id,
      p_date: data.scheduled_date,
      p_time: data.scheduled_time,
      p_duration_minutes: data.duration_minutes,
      p_session_type: data.session_type,
      p_booking_type: 'one_on_one'
    });

  if (availabilityError) {
    console.error('Error checking availability:', availabilityError);
    throw new Error('Failed to check instructor availability');
  }

  if (!isAvailable) {
    throw new Error('Instructor is not available at the selected time');
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert([{
      user_id: user.id,
      instructor_id: data.instructor_id,
      session_type: data.session_type,
      duration_minutes: data.duration_minutes,
      scheduled_date: data.scheduled_date,
      scheduled_time: data.scheduled_time,
      timezone: data.timezone || 'Asia/Tokyo',
      student_notes: data.student_notes,
      price_yen: data.price_yen,
      status: 'pending',
      payment_status: 'pending',
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", error);
    throw error;
  }

  return booking;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export async function getAvailableTimeSlots(
  instructorId: string,
  date: string, // YYYY-MM-DD
  sessionType: 'video' | 'in_person',
  durationMinutes: 30 | 60 | 90
): Promise<TimeSlot[]> {
  // Get day of week (0 = Sunday, 6 = Saturday)
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();

  // Get instructor availability for this day
  const { data: availability, error: availabilityError } = await supabase
    .from('instructor_availability')
    .select('*')
    .eq('instructor_id', instructorId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .or(`session_type.eq.${sessionType},session_type.eq.both`)
    .or(`booking_type.eq.one_on_one,booking_type.eq.both`);

  if (availabilityError) {
    console.error('Error fetching availability:', availabilityError);
    throw availabilityError;
  }

  if (!availability || availability.length === 0) {
    return [];
  }

  // Check blocked dates
  const { data: blockedDates } = await supabase
    .from('instructor_blocked_dates')
    .select('blocked_date')
    .eq('instructor_id', instructorId)
    .eq('blocked_date', date);

  if (blockedDates && blockedDates.length > 0) {
    return [];
  }

  // Get existing bookings for this date
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('scheduled_time, duration_minutes')
    .eq('instructor_id', instructorId)
    .eq('scheduled_date', date)
    .in('status', ['pending', 'confirmed']);

  // Generate time slots from availability windows
  const timeSlots: TimeSlot[] = [];
  const slotSet = new Set<string>();

  availability.forEach((avail) => {
    const start = new Date(`2000-01-01T${avail.start_time}`);
    const end = new Date(`2000-01-01T${avail.end_time}`);
    
    // Generate slots every 30 minutes
    let current = new Date(start);
    while (current < end) {
      const timeStr = current.toTimeString().slice(0, 5); // HH:MM
      
      // Check if slot fits the duration
      const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
      if (slotEnd <= end) {
        // Check if this slot conflicts with existing bookings
        const hasConflict = existingBookings?.some((booking) => {
          const bookingStart = new Date(`2000-01-01T${booking.scheduled_time}`);
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration_minutes * 60000);
          
          return (
            (current < bookingEnd && slotEnd > bookingStart)
          );
        });

        if (!hasConflict && !slotSet.has(timeStr)) {
          slotSet.add(timeStr);
          timeSlots.push({
            time: timeStr,
            available: true,
          });
        }
      }
      
      // Move to next 30-minute slot
      current = new Date(current.getTime() + 30 * 60000);
    }
  });

  // Sort by time
  timeSlots.sort((a, b) => a.time.localeCompare(b.time));

  return timeSlots;
}
