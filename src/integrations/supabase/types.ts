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
      profiles: {
        Row: {
          created_at: string
          exam_date: string | null
          full_name: string | null
          gender: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_user_curriculum: {
        Args: { p_user_id: string }
        Returns: undefined
      }
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
