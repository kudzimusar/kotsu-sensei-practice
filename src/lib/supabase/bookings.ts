import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: string;
  user_id: string;
  instructor_id: string;
  session_type: 'video' | 'in_person';
  duration_minutes: 30 | 60 | 90;
  scheduled_date: string;
  scheduled_time: string;
  timezone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  price_yen: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  stripe_payment_intent_id?: string;
  video_call_link?: string;
  video_call_provider?: 'zoom' | 'google_meet' | 'custom';
  meeting_location?: string;
  meeting_address?: string;
  student_notes?: string;
  instructor_notes?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  refund_amount?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  instructor_id: string;
  session_type: 'video' | 'in_person';
  duration_minutes: 30 | 60 | 90;
  scheduled_date: string;
  scheduled_time: string;
  timezone?: string;
  price_yen: number;
  student_notes?: string;
}

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBookingData): Promise<Booking> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      ...data,
      timezone: data.timezone || 'Asia/Tokyo',
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return booking as Booking;
}

/**
 * Get user's bookings
 */
export async function getUserBookings(status?: Booking['status']): Promise<Booking[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  let query = supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('scheduled_date', { ascending: false })
    .order('scheduled_time', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Booking[];
}

/**
 * Get booking by ID
 */
export async function getBookingById(bookingId: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as Booking;
}

/**
 * Update booking
 */
export async function updateBooking(
  bookingId: string,
  updates: Partial<Booking>
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
}

/**
 * Cancel booking
 */
export async function cancelBooking(
  bookingId: string,
  reason?: string
): Promise<Booking> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      cancellation_reason: reason,
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
}

/**
 * Check if instructor is available at a specific time
 */
export async function checkInstructorAvailability(
  instructorId: string,
  date: string,
  time: string,
  durationMinutes: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_instructor_available', {
    p_instructor_id: instructorId,
    p_date: date,
    p_time: time,
    p_duration_minutes: durationMinutes,
    p_session_type: 'video', // This should be passed as parameter
    p_booking_type: 'one_on_one',
  });

  if (error) {
    console.error('Error checking availability:', error);
    return false;
  }

  return data as boolean;
}

/**
 * Get available time slots for an instructor on a specific date
 */
export async function getAvailableTimeSlots(
  instructorId: string,
  date: string,
  sessionType: 'video' | 'in_person',
  durationMinutes: 30 | 60 | 90
): Promise<string[]> {
  // Get instructor availability for the day of week
  // JavaScript getDay() returns 0 (Sunday) to 6 (Saturday)
  // Database uses same format: 0 = Sunday, 1 = Monday, etc.
  const dayOfWeek = new Date(date).getDay();
  
  console.log('🔍 Fetching availability for:', {
    instructorId,
    date,
    dayOfWeek,
    sessionType,
    durationMinutes
  });
  
  const { data: availability, error } = await supabase
    .from('instructor_availability')
    .select('*')
    .eq('instructor_id', instructorId)
    .eq('day_of_week', dayOfWeek)
    .eq('session_type', sessionType)
    .eq('booking_type', 'one_on_one')
    .eq('is_active', true);
  
  console.log('📅 Availability found:', availability);

  if (error) throw error;

  // Get existing bookings for that date
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('scheduled_time, duration_minutes')
    .eq('instructor_id', instructorId)
    .eq('scheduled_date', date)
    .in('status', ['pending', 'confirmed']);

  if (bookingsError) throw bookingsError;

  // Get blocked dates
  const { data: blockedDates, error: blockedError } = await supabase
    .from('instructor_blocked_dates')
    .select('blocked_date')
    .eq('instructor_id', instructorId)
    .eq('blocked_date', date);

  if (blockedError) throw blockedError;

  if (blockedDates && blockedDates.length > 0) {
    return []; // Date is blocked
  }

  // Generate available time slots
  const availableSlots: string[] = [];
  
  if (!availability || availability.length === 0) {
    console.warn('⚠️ No availability found for instructor on this day');
    return [];
  }
  
  availability.forEach((avail) => {
    const start = new Date(`2000-01-01T${avail.start_time}`);
    const end = new Date(`2000-01-01T${avail.end_time}`);
    const duration = durationMinutes * 60 * 1000; // Convert to milliseconds

    console.log('⏰ Generating slots:', {
      start: avail.start_time,
      end: avail.end_time,
      duration: durationMinutes,
      durationMs: duration
    });

    let currentTime = new Date(start);
    let slotCount = 0;
    
    while (currentTime.getTime() + duration <= end.getTime()) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      const slotEnd = new Date(currentTime.getTime() + duration);
      
      // Check if this slot conflicts with existing bookings
      const hasConflict = bookings?.some((booking) => {
        const bookingStart = new Date(`2000-01-01T${booking.scheduled_time}`);
        const bookingEnd = new Date(bookingStart.getTime() + booking.duration_minutes * 60 * 1000);
        
        return (
          (currentTime >= bookingStart && currentTime < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (currentTime <= bookingStart && slotEnd >= bookingEnd)
        );
      });

      if (!hasConflict) {
        availableSlots.push(timeString);
        slotCount++;
      }

      // Move to next slot (30-minute intervals)
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }
    
    console.log(`✅ Generated ${slotCount} available slots from availability window`);
  });

  const sortedSlots = availableSlots.sort();
  console.log('📋 Final available slots:', sortedSlots);
  return sortedSlots;
}

