export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          converted: boolean | null
          created_at: string | null
          id: string
          ip_address: string | null
          product_id: string | null
          referral_code: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          converted?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          product_id?: string | null
          referral_code?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          converted?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          product_id?: string | null
          referral_code?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "affiliate_products"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_products: {
        Row: {
          affiliate_url: string
          category: string | null
          commission_rate: number
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          affiliate_url: string
          category?: string | null
          commission_rate?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          affiliate_url?: string
          category?: string | null
          commission_rate?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_generated_questions: {
        Row: {
          answer: boolean
          created_at: string | null
          difficulty_level: string | null
          explanation: string
          figure_description: string | null
          figure_url: string | null
          generated_at: string | null
          id: string
          language: string | null
          question: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_concept: string | null
          status: string | null
          test_category: string
          times_correct: number | null
          times_incorrect: number | null
          times_used: number | null
          updated_at: string | null
          user_feedback_score: number | null
        }
        Insert: {
          answer: boolean
          created_at?: string | null
          difficulty_level?: string | null
          explanation: string
          figure_description?: string | null
          figure_url?: string | null
          generated_at?: string | null
          id?: string
          language?: string | null
          question: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_concept?: string | null
          status?: string | null
          test_category: string
          times_correct?: number | null
          times_incorrect?: number | null
          times_used?: number | null
          updated_at?: string | null
          user_feedback_score?: number | null
        }
        Update: {
          answer?: boolean
          created_at?: string | null
          difficulty_level?: string | null
          explanation?: string
          figure_description?: string | null
          figure_url?: string | null
          generated_at?: string | null
          id?: string
          language?: string | null
          question?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_concept?: string | null
          status?: string | null
          test_category?: string
          times_correct?: number | null
          times_incorrect?: number | null
          times_used?: number | null
          updated_at?: string | null
          user_feedback_score?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          created_at: string
          duration_minutes: number
          id: string
          instructor_id: string
          instructor_notes: string | null
          meeting_address: string | null
          meeting_location: string | null
          payment_status: string
          price_yen: number
          refund_amount: number | null
          scheduled_date: string
          scheduled_time: string
          session_type: string
          status: string
          stripe_payment_intent_id: string | null
          student_notes: string | null
          timezone: string
          updated_at: string
          user_id: string
          video_call_link: string | null
          video_call_provider: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          created_at?: string
          duration_minutes: number
          id?: string
          instructor_id: string
          instructor_notes?: string | null
          meeting_address?: string | null
          meeting_location?: string | null
          payment_status?: string
          price_yen: number
          refund_amount?: number | null
          scheduled_date: string
          scheduled_time: string
          session_type: string
          status?: string
          stripe_payment_intent_id?: string | null
          student_notes?: string | null
          timezone?: string
          updated_at?: string
          user_id: string
          video_call_link?: string | null
          video_call_provider?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_id?: string
          instructor_notes?: string | null
          meeting_address?: string | null
          meeting_location?: string | null
          payment_status?: string
          price_yen?: number
          refund_amount?: number | null
          scheduled_date?: string
          scheduled_time?: string
          session_type?: string
          status?: string
          stripe_payment_intent_id?: string | null
          student_notes?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
          video_call_link?: string | null
          video_call_provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      category_performance: {
        Row: {
          category: string
          correct: number
          created_at: string
          guest_session_id: string | null
          id: string
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          correct?: number
          created_at?: string
          guest_session_id?: string | null
          id?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          correct?: number
          created_at?: string
          guest_session_id?: string | null
          id?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_performance_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_lesson_materials: {
        Row: {
          created_at: string
          id: string
          key_concepts: string[] | null
          lecture_number: number
          practice_questions: Json | null
          stage: string
          textbook_references: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_concepts?: string[] | null
          lecture_number: number
          practice_questions?: Json | null
          stage: string
          textbook_references?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key_concepts?: string[] | null
          lecture_number?: number
          practice_questions?: Json | null
          stage?: string
          textbook_references?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      driving_school_schedule: {
        Row: {
          created_at: string | null
          custom_label: string | null
          date: string
          event_type: string
          id: string
          instructor: string | null
          lecture_number: number | null
          location: string | null
          notes: string | null
          status: string | null
          symbol: string | null
          time_slot: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_label?: string | null
          date: string
          event_type: string
          id?: string
          instructor?: string | null
          lecture_number?: number | null
          location?: string | null
          notes?: string | null
          status?: string | null
          symbol?: string | null
          time_slot: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_label?: string | null
          date?: string
          event_type?: string
          id?: string
          instructor?: string | null
          lecture_number?: number | null
          location?: string | null
          notes?: string | null
          status?: string | null
          symbol?: string | null
          time_slot?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      guest_sessions: {
        Row: {
          created_at: string
          device_id: string | null
          expires_at: string
          id: string
          last_active: string
          session_id: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          expires_at?: string
          id?: string
          last_active?: string
          session_id?: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          expires_at?: string
          id?: string
          last_active?: string
          session_id?: string
        }
        Relationships: []
      }
      holidays: {
        Row: {
          country_code: string | null
          created_at: string | null
          date: string
          id: string
          name: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          date: string
          id?: string
          name: string
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          date?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      instructor_availability: {
        Row: {
          booking_type: string | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          instructor_id: string
          is_active: boolean
          session_type: string
          start_time: string
          updated_at: string
        }
        Insert: {
          booking_type?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          instructor_id: string
          is_active?: boolean
          session_type: string
          start_time: string
          updated_at?: string
        }
        Update: {
          booking_type?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          instructor_id?: string
          is_active?: boolean
          session_type?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_availability_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          instructor_id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          instructor_id: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          instructor_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_blocked_dates_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_pricing: {
        Row: {
          booking_type: string
          created_at: string
          duration_minutes: number
          id: string
          instructor_id: string
          is_active: boolean
          price_yen: number
          session_type: string
          updated_at: string
        }
        Insert: {
          booking_type: string
          created_at?: string
          duration_minutes: number
          id?: string
          instructor_id: string
          is_active?: boolean
          price_yen: number
          session_type: string
          updated_at?: string
        }
        Update: {
          booking_type?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_id?: string
          is_active?: boolean
          price_yen?: number
          session_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_pricing_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_reviews: {
        Row: {
          admin_response: string | null
          booking_id: string | null
          created_at: string
          helpful_count: number | null
          id: string
          instructor_id: string
          is_verified: boolean | null
          practice_room_id: string | null
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          booking_id?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          instructor_id: string
          is_verified?: boolean | null
          practice_room_id?: string | null
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          booking_id?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          instructor_id?: string
          is_verified?: boolean | null
          practice_room_id?: string | null
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructor_reviews_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructor_reviews_practice_room_id_fkey"
            columns: ["practice_room_id"]
            isOneToOne: false
            referencedRelation: "practice_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_minutes: number
          id: string
          instructor_id: string
          instructor_notes: string | null
          meeting_id: string | null
          meeting_link: string | null
          notes: string | null
          price_paid: number | null
          rating: number | null
          review: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["instructor_session_status"]
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
          user_notes: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_id: string
          instructor_notes?: string | null
          meeting_id?: string | null
          meeting_link?: string | null
          notes?: string | null
          price_paid?: number | null
          rating?: number | null
          review?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["instructor_session_status"]
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
          user_notes?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_id?: string
          instructor_notes?: string | null
          meeting_id?: string | null
          meeting_link?: string | null
          notes?: string | null
          price_paid?: number | null
          rating?: number | null
          review?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["instructor_session_status"]
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_sessions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          availability_schedule: Json | null
          available_for_in_person: boolean | null
          available_for_practice_rooms: boolean | null
          available_for_video: boolean | null
          bio: string | null
          certification_documents: string[] | null
          certification_filename: string | null
          certification_url: string | null
          created_at: string
          email: string
          full_name: string | null
          hourly_rate: number
          id: string
          is_active: boolean | null
          languages: string[] | null
          location_city: string | null
          location_coordinates: unknown
          location_prefecture: string | null
          max_practice_room_size: number | null
          name: string
          phone: string | null
          rating: number | null
          rejection_reason: string | null
          specializations: string[] | null
          status: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          total_reviews: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          availability_schedule?: Json | null
          available_for_in_person?: boolean | null
          available_for_practice_rooms?: boolean | null
          available_for_video?: boolean | null
          bio?: string | null
          certification_documents?: string[] | null
          certification_filename?: string | null
          certification_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          location_city?: string | null
          location_coordinates?: unknown
          location_prefecture?: string | null
          max_practice_room_size?: number | null
          name: string
          phone?: string | null
          rating?: number | null
          rejection_reason?: string | null
          specializations?: string[] | null
          status?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          availability_schedule?: Json | null
          available_for_in_person?: boolean | null
          available_for_practice_rooms?: boolean | null
          available_for_video?: boolean | null
          bio?: string | null
          certification_documents?: string[] | null
          certification_filename?: string | null
          certification_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          location_city?: string | null
          location_coordinates?: unknown
          location_prefecture?: string | null
          max_practice_room_size?: number | null
          name?: string
          phone?: string | null
          rating?: number | null
          rejection_reason?: string | null
          specializations?: string[] | null
          status?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      practice_room_participants: {
        Row: {
          created_at: string
          id: string
          is_host: boolean
          joined_at: string | null
          left_at: string | null
          payment_status: string
          practice_room_id: string
          price_paid_yen: number
          stripe_payment_intent_id: string | null
          student_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_host?: boolean
          joined_at?: string | null
          left_at?: string | null
          payment_status?: string
          practice_room_id: string
          price_paid_yen: number
          stripe_payment_intent_id?: string | null
          student_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_host?: boolean
          joined_at?: string | null
          left_at?: string | null
          payment_status?: string
          practice_room_id?: string
          price_paid_yen?: number
          stripe_payment_intent_id?: string | null
          student_notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_room_participants_practice_room_id_fkey"
            columns: ["practice_room_id"]
            isOneToOne: false
            referencedRelation: "practice_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_rooms: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          created_at: string
          current_participants: number
          description: string | null
          duration_minutes: number
          id: string
          instructor_id: string
          instructor_notes: string | null
          language: string
          max_participants: number
          meeting_address: string | null
          meeting_location: string | null
          min_participants: number
          price_per_participant_yen: number
          scheduled_date: string
          scheduled_time: string
          session_type: string
          status: string
          timezone: string
          title: string
          topic_focus: string[] | null
          total_price_yen: number
          updated_at: string
          video_call_link: string | null
          video_call_provider: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          created_at?: string
          current_participants?: number
          description?: string | null
          duration_minutes: number
          id?: string
          instructor_id: string
          instructor_notes?: string | null
          language?: string
          max_participants: number
          meeting_address?: string | null
          meeting_location?: string | null
          min_participants?: number
          price_per_participant_yen: number
          scheduled_date: string
          scheduled_time: string
          session_type: string
          status?: string
          timezone?: string
          title: string
          topic_focus?: string[] | null
          total_price_yen: number
          updated_at?: string
          video_call_link?: string | null
          video_call_provider?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          created_at?: string
          current_participants?: number
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor_id?: string
          instructor_notes?: string | null
          language?: string
          max_participants?: number
          meeting_address?: string | null
          meeting_location?: string | null
          min_participants?: number
          price_per_participant_yen?: number
          scheduled_date?: string
          scheduled_time?: string
          session_type?: string
          status?: string
          timezone?: string
          title?: string
          topic_focus?: string[] | null
          total_price_yen?: number
          updated_at?: string
          video_call_link?: string | null
          video_call_provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_rooms_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          exam_date: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_premium: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_premium?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_premium?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      question_generation_logs: {
        Row: {
          batch_id: string | null
          cost_estimate: number | null
          created_at: string | null
          generation_duration_ms: number | null
          id: string
          model_used: string
          prompt_used: string
          questions_generated: number | null
          questions_requested: number | null
          source_concept: string | null
          target_category: string | null
          target_language: string | null
          tokens_used: number | null
          triggered_by: string | null
        }
        Insert: {
          batch_id?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          generation_duration_ms?: number | null
          id?: string
          model_used: string
          prompt_used: string
          questions_generated?: number | null
          questions_requested?: number | null
          source_concept?: string | null
          target_category?: string | null
          target_language?: string | null
          tokens_used?: number | null
          triggered_by?: string | null
        }
        Update: {
          batch_id?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          generation_duration_ms?: number | null
          id?: string
          model_used?: string
          prompt_used?: string
          questions_generated?: number | null
          questions_requested?: number | null
          source_concept?: string | null
          target_category?: string | null
          target_language?: string | null
          tokens_used?: number | null
          triggered_by?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: boolean
          created_at: string
          difficulty: string | null
          explanation: string
          id: number
          image_path: string | null
          image_storage_path: string | null
          image_type: string | null
          image_url: string | null
          question_text: string
          tags: string[] | null
          test_category: string
          times_correct: number | null
          times_shown: number | null
          updated_at: string
        }
        Insert: {
          answer: boolean
          created_at?: string
          difficulty?: string | null
          explanation: string
          id?: never
          image_path?: string | null
          image_storage_path?: string | null
          image_type?: string | null
          image_url?: string | null
          question_text: string
          tags?: string[] | null
          test_category: string
          times_correct?: number | null
          times_shown?: number | null
          updated_at?: string
        }
        Update: {
          answer?: boolean
          created_at?: string
          difficulty?: string | null
          explanation?: string
          id?: never
          image_path?: string | null
          image_storage_path?: string | null
          image_type?: string | null
          image_url?: string | null
          question_text?: string
          tags?: string[] | null
          test_category?: string
          times_correct?: number | null
          times_shown?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_progress: {
        Row: {
          created_at: string
          current_question_index: number
          guest_session_id: string | null
          id: string
          quiz_mode: string
          score: number
          selected_questions: Json
          time_limit: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_question_index?: number
          guest_session_id?: string | null
          id?: string
          quiz_mode: string
          score?: number
          selected_questions: Json
          time_limit?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_question_index?: number
          guest_session_id?: string | null
          id?: string
          quiz_mode?: string
          score?: number
          selected_questions?: Json
          time_limit?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_progress_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      road_sign_flashcards: {
        Row: {
          answer: string
          category: string | null
          correct_answer: string | null
          created_at: string
          difficulty: string | null
          explanation: string | null
          id: string
          options: string[] | null
          question: string
          road_sign_image_id: string | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: string[] | null
          question: string
          road_sign_image_id?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: string[] | null
          question?: string
          road_sign_image_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "road_sign_flashcards_road_sign_image_id_fkey"
            columns: ["road_sign_image_id"]
            isOneToOne: false
            referencedRelation: "road_sign_images"
            referencedColumns: ["id"]
          },
        ]
      }
      road_sign_images: {
        Row: {
          ai_confidence: number | null
          ai_enhanced: boolean | null
          ai_enhanced_at: string | null
          ai_explanation: string | null
          artist_name: string | null
          attribution_text: string | null
          commonmetadata: Json | null
          created_at: string
          driver_behavior: string | null
          exif_metadata: Json | null
          expanded_meaning: string | null
          extmetadata: Json | null
          file_name: string
          file_size: number | null
          filename_slug: string | null
          flashcard_ready: boolean | null
          gemini_category: string | null
          id: string
          image_source: string | null
          is_verified: boolean | null
          legal_context: string | null
          license_info: string | null
          metadata_hydrated: boolean | null
          metadata_hydrated_at: string | null
          mime_type: string | null
          revision_id: number | null
          sha1: string | null
          sign_category: string | null
          sign_meaning: string | null
          sign_name_en: string | null
          sign_name_jp: string | null
          sign_number: string | null
          storage_path: string
          storage_type: string
          storage_url: string
          tags: string[] | null
          translated_japanese: string | null
          updated_at: string
          usage_count: number | null
          user_id: string | null
          wikimedia_file_name: string | null
          wikimedia_page_url: string | null
          wikimedia_pageid: number | null
          wikimedia_raw: Json | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_enhanced?: boolean | null
          ai_enhanced_at?: string | null
          ai_explanation?: string | null
          artist_name?: string | null
          attribution_text?: string | null
          commonmetadata?: Json | null
          created_at?: string
          driver_behavior?: string | null
          exif_metadata?: Json | null
          expanded_meaning?: string | null
          extmetadata?: Json | null
          file_name: string
          file_size?: number | null
          filename_slug?: string | null
          flashcard_ready?: boolean | null
          gemini_category?: string | null
          id?: string
          image_source?: string | null
          is_verified?: boolean | null
          legal_context?: string | null
          license_info?: string | null
          metadata_hydrated?: boolean | null
          metadata_hydrated_at?: string | null
          mime_type?: string | null
          revision_id?: number | null
          sha1?: string | null
          sign_category?: string | null
          sign_meaning?: string | null
          sign_name_en?: string | null
          sign_name_jp?: string | null
          sign_number?: string | null
          storage_path: string
          storage_type?: string
          storage_url: string
          tags?: string[] | null
          translated_japanese?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
          wikimedia_file_name?: string | null
          wikimedia_page_url?: string | null
          wikimedia_pageid?: number | null
          wikimedia_raw?: Json | null
        }
        Update: {
          ai_confidence?: number | null
          ai_enhanced?: boolean | null
          ai_enhanced_at?: string | null
          ai_explanation?: string | null
          artist_name?: string | null
          attribution_text?: string | null
          commonmetadata?: Json | null
          created_at?: string
          driver_behavior?: string | null
          exif_metadata?: Json | null
          expanded_meaning?: string | null
          extmetadata?: Json | null
          file_name?: string
          file_size?: number | null
          filename_slug?: string | null
          flashcard_ready?: boolean | null
          gemini_category?: string | null
          id?: string
          image_source?: string | null
          is_verified?: boolean | null
          legal_context?: string | null
          license_info?: string | null
          metadata_hydrated?: boolean | null
          metadata_hydrated_at?: string | null
          mime_type?: string | null
          revision_id?: number | null
          sha1?: string | null
          sign_category?: string | null
          sign_meaning?: string | null
          sign_name_en?: string | null
          sign_name_jp?: string | null
          sign_number?: string | null
          storage_path?: string
          storage_type?: string
          storage_url?: string
          tags?: string[] | null
          translated_japanese?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
          wikimedia_file_name?: string | null
          wikimedia_page_url?: string | null
          wikimedia_pageid?: number | null
          wikimedia_raw?: Json | null
        }
        Relationships: []
      }
      road_sign_questions: {
        Row: {
          answer: boolean
          created_at: string
          difficulty: string | null
          explanation: string
          id: string
          question_text: string
          road_sign_image_id: string | null
        }
        Insert: {
          answer: boolean
          created_at?: string
          difficulty?: string | null
          explanation: string
          id?: string
          question_text: string
          road_sign_image_id?: string | null
        }
        Update: {
          answer?: boolean
          created_at?: string
          difficulty?: string | null
          explanation?: string
          id?: string
          question_text?: string
          road_sign_image_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "road_sign_questions_road_sign_image_id_fkey"
            columns: ["road_sign_image_id"]
            isOneToOne: false
            referencedRelation: "road_sign_images"
            referencedColumns: ["id"]
          },
        ]
      }
      road_sign_tags: {
        Row: {
          created_at: string
          id: string
          sign_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          sign_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          sign_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "road_sign_tags_sign_id_fkey"
            columns: ["sign_id"]
            isOneToOne: false
            referencedRelation: "road_sign_images"
            referencedColumns: ["id"]
          },
        ]
      }
      sign_number_map: {
        Row: {
          created_at: string
          keyword: string
          sign_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          keyword: string
          sign_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          keyword?: string
          sign_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      study_events: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          instructor: string | null
          location: string | null
          time: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id?: string
          instructor?: string | null
          location?: string | null
          time?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          instructor?: string | null
          location?: string | null
          time?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_goals: {
        Row: {
          created_at: string
          daily_questions_target: number
          exam_prep_days: number
          id: string
          updated_at: string
          user_id: string
          weekly_study_hours_target: number
        }
        Insert: {
          created_at?: string
          daily_questions_target?: number
          exam_prep_days?: number
          id?: string
          updated_at?: string
          user_id: string
          weekly_study_hours_target?: number
        }
        Update: {
          created_at?: string
          daily_questions_target?: number
          exam_prep_days?: number
          id?: string
          updated_at?: string
          user_id?: string
          weekly_study_hours_target?: number
        }
        Relationships: []
      }
      subscription_usage: {
        Row: {
          count: number
          created_at: string
          feature_type: string
          id: string
          limit_count: number
          reset_at: string | null
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          feature_type: string
          id?: string
          limit_count?: number
          reset_at?: string | null
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          feature_type?: string
          id?: string
          limit_count?: number
          reset_at?: string | null
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      test_history: {
        Row: {
          created_at: string
          date: string
          guest_session_id: string | null
          id: string
          passed: boolean
          score: number
          test_type: string
          time_taken: number
          total_questions: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          guest_session_id?: string | null
          id?: string
          passed: boolean
          score: number
          test_type: string
          time_taken: number
          total_questions: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          guest_session_id?: string | null
          id?: string
          passed?: boolean
          score?: number
          test_type?: string
          time_taken?: number
          total_questions?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_history_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      textbook_chapters: {
        Row: {
          chapter_number: number
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          page_end: number | null
          page_start: number | null
          sort_order: number | null
          textbook_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          chapter_number: number
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          page_end?: number | null
          page_start?: number | null
          sort_order?: number | null
          textbook_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          chapter_number?: number
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          page_end?: number | null
          page_start?: number | null
          sort_order?: number | null
          textbook_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "textbook_chapters_textbook_id_fkey"
            columns: ["textbook_id"]
            isOneToOne: false
            referencedRelation: "textbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      textbook_terminology: {
        Row: {
          category: string | null
          chapter_reference: string | null
          created_at: string | null
          definition: string
          example_usage: string | null
          id: string
          related_terms: string[] | null
          sort_order: number | null
          term: string
          textbook_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          chapter_reference?: string | null
          created_at?: string | null
          definition: string
          example_usage?: string | null
          id?: string
          related_terms?: string[] | null
          sort_order?: number | null
          term: string
          textbook_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          chapter_reference?: string | null
          created_at?: string | null
          definition?: string
          example_usage?: string | null
          id?: string
          related_terms?: string[] | null
          sort_order?: number | null
          term?: string
          textbook_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "textbook_terminology_textbook_id_fkey"
            columns: ["textbook_id"]
            isOneToOne: false
            referencedRelation: "textbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      textbooks: {
        Row: {
          amazon_link: string | null
          author: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          isbn: string | null
          language: string | null
          price: number | null
          publisher: string | null
          purchase_links: Json | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amazon_link?: string | null
          author?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          isbn?: string | null
          language?: string | null
          price?: number | null
          publisher?: string | null
          purchase_links?: Json | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amazon_link?: string | null
          author?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          isbn?: string | null
          language?: string | null
          price?: number | null
          publisher?: string | null
          purchase_links?: Json | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_earnings: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          paid_at: string | null
          reference_id: string | null
          source: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          reference_id?: string | null
          source: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          reference_id?: string | null
          source?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_flashcard_progress: {
        Row: {
          attempts: number | null
          correct: number | null
          first_seen: string | null
          flashcard_id: string
          id: string
          incorrect: number | null
          last_correct: string | null
          last_incorrect: string | null
          last_seen: string | null
          mastered: boolean | null
          mastered_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          correct?: number | null
          first_seen?: string | null
          flashcard_id: string
          id?: string
          incorrect?: number | null
          last_correct?: string | null
          last_incorrect?: string | null
          last_seen?: string | null
          mastered?: boolean | null
          mastered_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          correct?: number | null
          first_seen?: string | null
          flashcard_id?: string
          id?: string
          incorrect?: number | null
          last_correct?: string | null
          last_incorrect?: string | null
          last_seen?: string | null
          mastered?: boolean | null
          mastered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcard_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "road_sign_flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lecture_schedule: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          lecture_number: number
          scheduled_date: string | null
          stage: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lecture_number: number
          scheduled_date?: string | null
          stage: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lecture_number?: number
          scheduled_date?: string | null
          stage?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_question_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_accurate: boolean | null
          is_clear: boolean | null
          question_id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_accurate?: boolean | null
          is_clear?: boolean | null
          question_id: string
          rating?: number | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_accurate?: boolean | null
          is_clear?: boolean | null
          question_id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_feedback_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "ai_generated_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_referrals: {
        Row: {
          commission_earned: number | null
          completed_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          referral_code: string
          referred_user_id: string | null
          referrer_user_id: string
          status: string | null
        }
        Insert: {
          commission_earned?: number | null
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          referral_code: string
          referred_user_id?: string | null
          referrer_user_id: string
          status?: string | null
        }
        Update: {
          commission_earned?: number | null
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string | null
          referrer_user_id?: string
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          push_notifications: boolean
          study_reminders: boolean
          test_reminders: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          push_notifications?: boolean
          study_reminders?: boolean
          test_reminders?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          push_notifications?: boolean
          study_reminders?: boolean
          test_reminders?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_complete_past_schedule_events: { Args: never; Returns: undefined }
      check_and_increment_usage: {
        Args: {
          p_feature_type: string
          p_increment_by?: number
          p_user_id: string
        }
        Returns: Json
      }
      get_hydration_status: {
        Args: never
        Returns: {
          hydrated_count: number
          hydration_percentage: number
          total_images: number
          unhydrated_count: number
        }[]
      }
      get_user_feature_limit: {
        Args: { p_feature_type: string; p_user_id: string }
        Returns: number
      }
      get_user_weak_areas: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          accuracy: number
          attempts: number
          correct: number
          flashcard_id: string
          sign_category: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_image_usage: { Args: { image_id: string }; Returns: undefined }
      initialize_user_curriculum: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_instructor_available: {
        Args: {
          p_booking_type?: string
          p_date: string
          p_duration_minutes: number
          p_instructor_id: string
          p_session_type: string
          p_time: string
        }
        Returns: boolean
      }
      is_user_premium: { Args: { p_user_id: string }; Returns: boolean }
      mark_schedule_event_complete: {
        Args: { event_id: string }
        Returns: {
          created_at: string | null
          custom_label: string | null
          date: string
          event_type: string
          id: string
          instructor: string | null
          lecture_number: number | null
          location: string | null
          notes: string | null
          status: string | null
          symbol: string | null
          time_slot: string
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "driving_school_schedule"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      migrate_guest_to_user: {
        Args: { p_guest_session_id: string; p_user_id: string }
        Returns: Json
      }
      reset_daily_usage: { Args: never; Returns: undefined }
      search_road_signs: {
        Args: { raw_q: string }
        Returns: {
          artist_name: string
          attribution_text: string
          file_name: string
          filename_slug: string
          id: string
          license_info: string
          score: number
          sign_category: string
          sign_name_en: string
          sign_name_jp: string
          sign_number: string
          storage_url: string
          tags: string[]
          wikimedia_file_name: string
          wikimedia_page_url: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_flashcard_progress: {
        Args: {
          p_flashcard_id: string
          p_is_correct: boolean
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      instructor_session_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "no_show"
      subscription_plan_type: "monthly" | "quarterly" | "annual" | "lifetime"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "incomplete"
        | "incomplete_expired"
        | "unpaid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      instructor_session_status: [
        "scheduled",
        "completed",
        "cancelled",
        "no_show",
      ],
      subscription_plan_type: ["monthly", "quarterly", "annual", "lifetime"],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "trialing",
        "incomplete",
        "incomplete_expired",
        "unpaid",
      ],
    },
  },
} as const
