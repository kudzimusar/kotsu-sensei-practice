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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
