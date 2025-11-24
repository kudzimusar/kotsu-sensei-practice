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
