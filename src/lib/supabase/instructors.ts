import { supabase } from "@/integrations/supabase/client";

export interface Instructor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  languages: string[];
  certification_number?: string;
  certification_documents: string[];
  bio?: string;
  specializations: string[];
  years_experience: number;
  rating: number;
  total_reviews: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  location_prefecture?: string;
  location_city?: string;
  location_address?: string;
  location_coordinates?: { x: number; y: number };
  available_for_video: boolean;
  available_for_in_person: boolean;
  available_for_practice_rooms: boolean;
  max_practice_room_size: number;
  created_at: string;
  updated_at: string;
}

export interface InstructorRegistrationData {
  full_name: string;
  email: string;
  phone?: string;
  languages: string[];
  certification_number?: string;
  certification_documents: string[];
  bio?: string;
  specializations: string[];
  years_experience: number;
  location_prefecture?: string;
  location_city?: string;
  location_address?: string;
  location_coordinates?: { x: number; y: number };
  available_for_video: boolean;
  available_for_in_person: boolean;
  available_for_practice_rooms: boolean;
  max_practice_room_size: number;
}

export interface InstructorPricing {
  id: string;
  instructor_id: string;
  duration_minutes: 30 | 60 | 90;
  session_type: 'video' | 'in_person';
  booking_type: 'one_on_one' | 'practice_room';
  price_yen: number;
  is_active: boolean;
}

export interface InstructorAvailability {
  id: string;
  instructor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  session_type: 'video' | 'in_person';
  booking_type: 'one_on_one' | 'practice_room';
  is_active: boolean;
}

/**
 * Get instructor by user ID
 */
export async function getInstructorByUserId(userId: string): Promise<Instructor | null> {
  const { data, error } = await supabase
    .from('instructors')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data as Instructor;
}

/**
 * Get instructor by ID
 */
export async function getInstructorById(instructorId: string): Promise<Instructor | null> {
  const { data, error } = await supabase
    .from('instructors')
    .select('*')
    .eq('id', instructorId)
    .eq('status', 'approved')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as Instructor;
}

/**
 * Get all approved instructors
 */
export async function getApprovedInstructors(filters?: {
  languages?: string[];
  session_type?: 'video' | 'in_person';
  location_prefecture?: string;
  min_rating?: number;
}): Promise<Instructor[]> {
  let query = supabase
    .from('instructors')
    .select('*')
    .eq('status', 'approved');

  if (filters?.languages && filters.languages.length > 0) {
    query = query.contains('languages', filters.languages);
  }

  if (filters?.session_type) {
    if (filters.session_type === 'video') {
      query = query.eq('available_for_video', true);
    } else {
      query = query.eq('available_for_in_person', true);
    }
  }

  if (filters?.location_prefecture) {
    query = query.eq('location_prefecture', filters.location_prefecture);
  }

  if (filters?.min_rating) {
    query = query.gte('rating', filters.min_rating);
  }

  const { data, error } = await query.order('rating', { ascending: false });

  if (error) throw error;
  return (data || []) as Instructor[];
}

/**
 * Register as instructor
 */
export async function registerAsInstructor(
  data: InstructorRegistrationData
): Promise<Instructor> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  // Check if instructor profile already exists
  const existing = await getInstructorByUserId(user.id);
  if (existing) {
    throw new Error('Instructor profile already exists');
  }

  const { data: instructor, error } = await supabase
    .from('instructors')
    .insert({
      user_id: user.id,
      ...data,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return instructor as Instructor;
}

/**
 * Update instructor profile
 */
export async function updateInstructorProfile(
  instructorId: string,
  updates: Partial<InstructorRegistrationData>
): Promise<Instructor> {
  const { data, error } = await supabase
    .from('instructors')
    .update(updates)
    .eq('id', instructorId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Upload certification document
 */
export async function uploadCertificationDocument(
  file: File,
  userId: string
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const filePath = `instructor-certifications/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('instructor-certifications')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('instructor-certifications')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Get instructor pricing
 */
export async function getInstructorPricing(
  instructorId: string
): Promise<InstructorPricing[]> {
  const { data, error } = await supabase
    .from('instructor_pricing')
    .select('*')
    .eq('instructor_id', instructorId)
    .eq('is_active', true)
    .order('duration_minutes', { ascending: true });

  if (error) throw error;
  return (data || []) as InstructorPricing[];
}

/**
 * Set instructor pricing
 */
export async function setInstructorPricing(
  instructorId: string,
  pricing: Omit<InstructorPricing, 'id' | 'instructor_id' | 'created_at' | 'updated_at'>[]
): Promise<InstructorPricing[]> {
  // Delete existing pricing
  await supabase
    .from('instructor_pricing')
    .delete()
    .eq('instructor_id', instructorId);

  // Insert new pricing
  const pricingData = pricing.map(p => ({
    instructor_id: instructorId,
    ...p,
  }));

  const { data, error } = await supabase
    .from('instructor_pricing')
    .insert(pricingData)
    .select();

  if (error) throw error;
  return (data || []) as InstructorPricing[];
}

/**
 * Get instructor availability
 */
export async function getInstructorAvailability(
  instructorId: string
): Promise<InstructorAvailability[]> {
  const { data, error } = await supabase
    .from('instructor_availability')
    .select('*')
    .eq('instructor_id', instructorId)
    .eq('is_active', true)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data || []) as InstructorAvailability[];
}

/**
 * Set instructor availability
 */
export async function setInstructorAvailability(
  instructorId: string,
  availability: Omit<InstructorAvailability, 'id' | 'instructor_id' | 'created_at' | 'updated_at'>[]
): Promise<InstructorAvailability[]> {
  // Delete existing availability
  await supabase
    .from('instructor_availability')
    .delete()
    .eq('instructor_id', instructorId);

  // Insert new availability
  const availabilityData = availability.map(a => ({
    instructor_id: instructorId,
    ...a,
  }));

  const { data, error } = await supabase
    .from('instructor_availability')
    .insert(availabilityData)
    .select();

  if (error) throw error;
  return (data || []) as InstructorAvailability[];
}

/**
 * Get all instructors (admin only)
 */
export async function getAllInstructors(status?: Instructor['status']): Promise<Instructor[]> {
  let query = supabase
    .from('instructors')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Instructor[];
}

/**
 * Approve instructor (admin only)
 */
export async function approveInstructor(
  instructorId: string,
  adminUserId: string
): Promise<Instructor> {
  const { data, error } = await supabase
    .from('instructors')
    .update({
      status: 'approved',
      approved_by: adminUserId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', instructorId)
    .select()
    .single();

  if (error) throw error;
  return data as Instructor;
}

/**
 * Reject instructor (admin only)
 */
export async function rejectInstructor(
  instructorId: string,
  rejectionReason: string
): Promise<Instructor> {
  const { data, error } = await supabase
    .from('instructors')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
    })
    .eq('id', instructorId)
    .select()
    .single();

  if (error) throw error;
  return data as Instructor;
}

/**
 * Suspend instructor (admin only)
 */
export async function suspendInstructor(
  instructorId: string,
  reason?: string
): Promise<Instructor> {
  const { data, error } = await supabase
    .from('instructors')
    .update({
      status: 'suspended',
      rejection_reason: reason,
    })
    .eq('id', instructorId)
    .select()
    .single();

  if (error) throw error;
  return data as Instructor;
}

