import { supabase } from "@/integrations/supabase/client";
import { uploadToS3 } from "@/lib/aws/s3-upload";

export interface Instructor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  languages?: string[];
  hourly_rate: number;
  rating?: number;
  total_sessions?: number;
  is_active?: boolean;
  availability_schedule?: any;
  certification_url?: string;
  certification_filename?: string;
  created_at: string;
  updated_at: string;
}

export interface InstructorSession {
  id: string;
  user_id: string;
  instructor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  meeting_link?: string;
  meeting_id?: string;
  notes?: string;
  user_notes?: string;
  instructor_notes?: string;
  price_paid?: number;
  stripe_payment_intent_id?: string;
  rating?: number;
  review?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export async function getInstructors() {
  const { data, error } = await supabase
    .from('instructors')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false });

  if (error) throw error;
  return data as Instructor[];
}

export async function getInstructorById(id: string) {
  const { data, error } = await supabase
    .from('instructors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Instructor;
}

export async function createInstructor(
  instructorData: Omit<Instructor, 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_sessions'>
) {
  const { data, error } = await supabase
    .from('instructors')
    .insert(instructorData)
    .select()
    .single();

  if (error) throw error;
  return data as Instructor;
}

export async function uploadCertification(file: File): Promise<string> {
  const result = await uploadToS3(file, 'instructor-certifications');
  return result.publicUrl;
}

export async function getUserSessions(userId: string) {
  const { data, error } = await supabase
    .from('instructor_sessions')
    .select(`
      *,
      instructor:instructors(*)
    `)
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createSession(sessionData: {
  instructor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  notes?: string;
  price_paid: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('instructor_sessions')
    .insert({
      ...sessionData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as InstructorSession;
}
