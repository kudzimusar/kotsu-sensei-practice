import { supabase } from "@/integrations/supabase/client";

export interface PracticeRoom {
  id: string;
  instructor_id: string;
  title: string;
  description?: string;
  session_type: 'video' | 'in_person';
  duration_minutes: 30 | 60 | 90;
  scheduled_date: string;
  scheduled_time: string;
  timezone: string;
  max_participants: number;
  min_participants: number;
  current_participants: number;
  price_per_participant_yen: number;
  total_price_yen: number;
  status: 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';
  video_call_link?: string;
  video_call_provider?: 'zoom' | 'google_meet' | 'custom';
  meeting_location?: string;
  meeting_address?: string;
  topic_focus: string[];
  language: 'english' | 'japanese' | 'both';
  instructor_notes?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PracticeRoomParticipant {
  id: string;
  practice_room_id: string;
  user_id: string;
  price_paid_yen: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  stripe_payment_intent_id?: string;
  joined_at?: string;
  left_at?: string;
  student_notes?: string;
  is_host: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePracticeRoomData {
  instructor_id: string;
  title: string;
  description?: string;
  session_type: 'video' | 'in_person';
  duration_minutes: 30 | 60 | 90;
  scheduled_date: string;
  scheduled_time: string;
  max_participants: number;
  min_participants?: number;
  price_per_participant_yen: number;
  topic_focus?: string[];
  language?: 'english' | 'japanese' | 'both';
  instructor_notes?: string;
}

/**
 * Get available practice rooms
 */
export async function getAvailablePracticeRooms(filters?: {
  instructor_id?: string;
  session_type?: 'video' | 'in_person';
  language?: 'english' | 'japanese' | 'both';
  date?: string;
}): Promise<PracticeRoom[]> {
  let query = supabase
    .from('practice_rooms')
    .select('*')
    .in('status', ['open'])
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true });

  if (filters?.instructor_id) {
    query = query.eq('instructor_id', filters.instructor_id);
  }

  if (filters?.session_type) {
    query = query.eq('session_type', filters.session_type);
  }

  if (filters?.language) {
    query = query.eq('language', filters.language);
  }

  if (filters?.date) {
    query = query.eq('scheduled_date', filters.date);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as PracticeRoom[];
}

/**
 * Get practice room by ID
 */
export async function getPracticeRoomById(roomId: string): Promise<PracticeRoom | null> {
  const { data, error } = await supabase
    .from('practice_rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as PracticeRoom;
}

/**
 * Get practice room participants
 */
export async function getPracticeRoomParticipants(roomId: string): Promise<PracticeRoomParticipant[]> {
  const { data, error } = await supabase
    .from('practice_room_participants')
    .select('*')
    .eq('practice_room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as PracticeRoomParticipant[];
}

/**
 * Create a practice room (instructor only)
 */
export async function createPracticeRoom(data: CreatePracticeRoomData): Promise<PracticeRoom> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  // Verify user is the instructor
  const { data: instructor } = await supabase
    .from('instructors')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('id', data.instructor_id)
    .single();

  if (!instructor || instructor.status !== 'approved') {
    throw new Error('Only approved instructors can create practice rooms');
  }

  const totalPrice = data.price_per_participant_yen * data.max_participants;

  const { data: room, error } = await supabase
    .from('practice_rooms')
    .insert({
      ...data,
      min_participants: data.min_participants || 2,
      total_price_yen: totalPrice,
      timezone: 'Asia/Tokyo',
      language: data.language || 'both',
      topic_focus: data.topic_focus || [],
      status: 'open',
      current_participants: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return room as PracticeRoom;
}

/**
 * Join a practice room
 */
export async function joinPracticeRoom(roomId: string): Promise<PracticeRoomParticipant> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  // Get room details
  const room = await getPracticeRoomById(roomId);
  if (!room) {
    throw new Error('Practice room not found');
  }

  if (room.status !== 'open') {
    throw new Error('Practice room is not open for joining');
  }

  if (room.current_participants >= room.max_participants) {
    throw new Error('Practice room is full');
  }

  // Check if user is already a participant
  const { data: existing } = await supabase
    .from('practice_room_participants')
    .select('id')
    .eq('practice_room_id', roomId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    throw new Error('You are already a participant in this practice room');
  }

  // Create participant record (payment will be handled separately)
  const { data: participant, error } = await supabase
    .from('practice_room_participants')
    .insert({
      practice_room_id: roomId,
      user_id: user.id,
      price_paid_yen: room.price_per_participant_yen,
      payment_status: 'pending',
      is_host: false,
    })
    .select()
    .single();

  if (error) throw error;
  return participant as PracticeRoomParticipant;
}

/**
 * Leave a practice room
 */
export async function leavePracticeRoom(roomId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { error } = await supabase
    .from('practice_room_participants')
    .update({
      left_at: new Date().toISOString(),
    })
    .eq('practice_room_id', roomId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Get user's practice rooms
 */
export async function getUserPracticeRooms(): Promise<PracticeRoom[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { data: participants, error: participantsError } = await supabase
    .from('practice_room_participants')
    .select('practice_room_id')
    .eq('user_id', user.id);

  if (participantsError) throw participantsError;

  if (!participants || participants.length === 0) {
    return [];
  }

  const roomIds = participants.map(p => p.practice_room_id);

  const { data: rooms, error: roomsError } = await supabase
    .from('practice_rooms')
    .select('*')
    .in('id', roomIds)
    .order('scheduled_date', { ascending: false })
    .order('scheduled_time', { ascending: false });

  if (roomsError) throw roomsError;
  return (rooms || []) as PracticeRoom[];
}

