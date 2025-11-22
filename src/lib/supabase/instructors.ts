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
    .insert([{
      ...data,
      name: data.full_name, // Map full_name to name for backward compatibility
    }])
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
  return data as Instructor;
}

/**
 * Upload certification document (alias for compatibility)
 */
export async function uploadCertification(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');
  return uploadCertificationDocument(file, user.id);
}

/**
 * Upload certification document to AWS S3 with Supabase Storage fallback
 */
export async function uploadCertificationDocument(
  file: File,
  userId: string
): Promise<string> {
  console.log('📤 Starting certification upload to AWS S3');
  console.log('File details:', { name: file.name, type: file.type, size: file.size });
  
  try {
    // Try S3 upload first (AWS is primary)
    const { uploadToS3 } = await import('@/lib/aws/s3-upload');
    const result = await uploadToS3(file, 'instructor-certifications');
    console.log('✅ AWS S3 upload successful:', result.publicUrl);
    return result.publicUrl;
  } catch (s3Error: any) {
    console.warn('❌ AWS S3 upload failed, trying Supabase Storage fallback:', s3Error);
    
    // Fallback to Supabase Storage
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      // File path should be: userId/filename (bucket name is already 'instructor-certifications')
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('instructor-certifications')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // If bucket doesn't exist, try to create it
        if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
          console.log('Creating instructor-certifications bucket...');
          const { error: createError } = await supabase.storage.createBucket('instructor-certifications', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
          });

          if (createError) {
            console.error('Failed to create bucket:', createError);
            // Try upload again after bucket creation attempt
            const { data: retryData, error: retryError } = await supabase.storage
              .from('instructor-certifications')
              .upload(filePath, file);

            if (retryError) {
              throw new Error(`Supabase Storage upload failed: ${retryError.message}`);
            }
          }
        } else {
          throw new Error(`Supabase Storage upload failed: ${error.message}`);
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('instructor-certifications')
        .getPublicUrl(filePath);

      console.log('✅ Successfully uploaded to Supabase Storage:', publicUrl);
      return publicUrl;
    } catch (storageError: any) {
      console.error('❌ Both S3 and Supabase Storage uploads failed');
      
      // Provide detailed error messages based on the error type
      const s3ErrorMessage = s3Error?.message || '';
      const storageErrorMessage = storageError?.message || '';
      
      if (s3ErrorMessage.includes('401') || s3ErrorMessage.includes('Unauthorized')) {
        throw new Error('Authentication failed. Please log out and log in again, then try uploading.');
      } else if (s3ErrorMessage.includes('403') || s3ErrorMessage.includes('Forbidden')) {
        throw new Error('Access denied to AWS S3. Please contact support to verify your AWS permissions.');
      } else if (s3ErrorMessage.includes('Bucket not found') || s3ErrorMessage.includes('NoSuchBucket')) {
        throw new Error('AWS S3 bucket not found. Please verify the bucket name and region are correct.');
      } else if (s3ErrorMessage.includes('Invalid AWS region')) {
        throw new Error('Invalid AWS region configuration. Please contact support to update the AWS region setting.');
      } else {
        throw new Error(
          `Upload failed. S3 error: ${s3ErrorMessage || 'Unknown'}. ` +
          `Storage fallback error: ${storageErrorMessage || 'Unknown'}. ` +
          `Please try again or contact support.`
        );
      }
    }
  }
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

  if (error) {
    console.error('Error fetching instructor pricing:', error);
    throw error;
  }

  // Ensure price_yen is a number (Supabase may return it as a string)
  const pricing = (data || []).map(p => ({
    ...p,
    price_yen: typeof p.price_yen === 'string' ? parseFloat(p.price_yen) : p.price_yen,
  })) as InstructorPricing[];

  console.log('Fetched pricing for instructor:', instructorId, pricing);
  return pricing;
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

  // Create default pricing if none exists
  const existingPricing = await getInstructorPricing(instructorId);
  if (existingPricing.length === 0) {
    // Set default pricing: 2000 yen per 30 min, 3500 yen per 60 min, 5000 yen per 90 min
    const defaultPricing = [
      { duration_minutes: 30 as const, session_type: 'video' as const, booking_type: 'one_on_one' as const, price_yen: 2000, is_active: true },
      { duration_minutes: 60 as const, session_type: 'video' as const, booking_type: 'one_on_one' as const, price_yen: 3500, is_active: true },
      { duration_minutes: 90 as const, session_type: 'video' as const, booking_type: 'one_on_one' as const, price_yen: 5000, is_active: true },
    ];
    
    try {
      await setInstructorPricing(instructorId, defaultPricing);
    } catch (pricingError) {
      console.error('Failed to set default pricing:', pricingError);
      // Don't fail the approval if pricing setup fails
    }
  }

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
  reason?: string,
  adminUserId?: string
): Promise<Instructor> {
  const { data: { user } } = await supabase.auth.getUser();
  const suspendingAdminId = adminUserId || user?.id;

  const { data, error } = await supabase
    .from('instructors')
    .update({
      status: 'suspended',
      suspension_reason: reason,
      suspended_at: new Date().toISOString(),
      suspended_by: suspendingAdminId || null,
    })
    .eq('id', instructorId)
    .select()
    .single();

  if (error) throw error;
  return data as Instructor;
}

