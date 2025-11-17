import { supabase } from "@/integrations/supabase/client";

export interface InstructorReview {
  id: string;
  booking_id?: string;
  practice_room_id?: string;
  instructor_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  language_quality?: number;
  teaching_quality?: number;
  punctuality?: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewData {
  booking_id?: string;
  practice_room_id?: string;
  instructor_id: string;
  rating: number;
  comment?: string;
  language_quality?: number;
  teaching_quality?: number;
  punctuality?: number;
}

/**
 * Create a review for an instructor
 */
export async function createReview(data: CreateReviewData): Promise<InstructorReview> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  // Check if review already exists
  if (data.booking_id) {
    const { data: existing } = await supabase
      .from('instructor_reviews')
      .select('id')
      .eq('booking_id', data.booking_id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      throw new Error('Review already exists for this booking');
    }
  }

  if (data.practice_room_id) {
    const { data: existing } = await supabase
      .from('instructor_reviews')
      .select('id')
      .eq('practice_room_id', data.practice_room_id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      throw new Error('Review already exists for this practice room');
    }
  }

  const { data: review, error } = await supabase
    .from('instructor_reviews')
    .insert({
      user_id: user.id,
      ...data,
      is_verified: true, // Auto-verify if booking exists
    })
    .select()
    .single();

  if (error) throw error;
  return review as InstructorReview;
}

/**
 * Get reviews for an instructor
 */
export async function getInstructorReviews(instructorId: string): Promise<InstructorReview[]> {
  const { data, error } = await supabase
    .from('instructor_reviews')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as InstructorReview[];
}

/**
 * Get review by booking ID
 */
export async function getReviewByBookingId(bookingId: string): Promise<InstructorReview | null> {
  const { data, error } = await supabase
    .from('instructor_reviews')
    .select('*')
    .eq('booking_id', bookingId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as InstructorReview;
}

/**
 * Update a review
 */
export async function updateReview(
  reviewId: string,
  updates: Partial<CreateReviewData>
): Promise<InstructorReview> {
  const { data, error } = await supabase
    .from('instructor_reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data as InstructorReview;
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('instructor_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
}

