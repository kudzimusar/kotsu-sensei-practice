import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type PracticeRoom = Tables<"practice_rooms">;
export type PracticeRoomParticipant = Tables<"practice_room_participants">;

interface GetAvailableRoomsFilters {
  session_type?: "video" | "in_person";
  language?: "english" | "japanese" | "both";
}

export async function getAvailablePracticeRooms(
  filters?: GetAvailableRoomsFilters
): Promise<PracticeRoom[]> {
  let query = supabase
    .from("practice_rooms")
    .select("*")
    .eq("status", "scheduled");

  if (filters?.session_type) {
    query = query.eq("session_type", filters.session_type);
  }

  if (filters?.language) {
    query = query.eq("language", filters.language);
  }

  const { data, error } = await query.order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error fetching practice rooms:", error);
    throw error;
  }

  return data || [];
}

export async function getPracticeRoomById(roomId: string): Promise<PracticeRoom | null> {
  const { data, error } = await supabase
    .from("practice_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) {
    console.error("Error fetching practice room:", error);
    throw error;
  }

  return data;
}

export async function getUserPracticeRooms(): Promise<PracticeRoom[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data: participants, error: participantsError } = await supabase
    .from("practice_room_participants")
    .select("practice_room_id")
    .eq("user_id", user.id);

  if (participantsError) {
    console.error("Error fetching user practice room participants:", participantsError);
    throw participantsError;
  }

  if (!participants || participants.length === 0) return [];

  const roomIds = participants.map(p => p.practice_room_id);

  const { data, error } = await supabase
    .from("practice_rooms")
    .select("*")
    .in("id", roomIds)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error fetching user practice rooms:", error);
    throw error;
  }

  return data || [];
}

export async function joinPracticeRoom(roomId: string): Promise<PracticeRoomParticipant> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: room, error: roomError } = await supabase
    .from("practice_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (roomError) {
    console.error("Error fetching room:", roomError);
    throw new Error("Practice room not found");
  }

  if (room.current_participants >= room.max_participants) {
    throw new Error("Practice room is full");
  }

  const { data, error } = await supabase
    .from("practice_room_participants")
    .insert({
      practice_room_id: roomId,
      user_id: user.id,
      price_paid_yen: room.price_per_participant_yen,
      payment_status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error joining practice room:", error);
    throw error;
  }

  // Update current participants count
  await supabase
    .from("practice_rooms")
    .update({ current_participants: room.current_participants + 1 })
    .eq("id", roomId);

  return data;
}

export async function getPracticeRoomParticipants(roomId: string): Promise<PracticeRoomParticipant[]> {
  const { data, error } = await supabase
    .from("practice_room_participants")
    .select("*")
    .eq("practice_room_id", roomId);

  if (error) {
    console.error("Error fetching practice room participants:", error);
    throw error;
  }

  return data || [];
}
