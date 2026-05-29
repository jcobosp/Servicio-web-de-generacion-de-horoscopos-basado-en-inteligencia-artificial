// Tipos generados automáticamente desde el esquema de Supabase.
// Para regenerar tras un cambio de esquema:
//   supabase gen types typescript --project-id <ref> > src/types/supabase.ts
// No editar a mano.

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      astro_events: {
        Row: {
          created_at: string
          description: string
          event_date: string
          id: string
          is_premium: boolean
          kind: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          event_date: string
          id?: string
          is_premium?: boolean
          kind: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          event_date?: string
          id?: string
          is_premium?: boolean
          kind?: string
          title?: string
        }
        Relationships: []
      }
      compatibility_credits: {
        Row: {
          consumed_at: string | null
          created_at: string
          id: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          id?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          id?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      compatibility_reports: {
        Row: {
          billing: string
          created_at: string
          id: string
          pair_key: string | null
          person_a: Json
          person_a_label: string
          person_b: Json
          person_b_label: string
          report: string
          score: number
          user_id: string
        }
        Insert: {
          billing?: string
          created_at?: string
          id?: string
          pair_key?: string | null
          person_a: Json
          person_a_label: string
          person_b: Json
          person_b_label: string
          report: string
          score: number
          user_id: string
        }
        Update: {
          billing?: string
          created_at?: string
          id?: string
          pair_key?: string | null
          person_a?: Json
          person_a_label?: string
          person_b?: Json
          person_b_label?: string
          report?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      daily_energy: {
        Row: {
          content: Json
          created_at: string
          date: string
          id: string
          sun_sign: string
        }
        Insert: {
          content: Json
          created_at?: string
          date: string
          id?: string
          sun_sign: string
        }
        Update: {
          content?: Json
          created_at?: string
          date?: string
          id?: string
          sun_sign?: string
        }
        Relationships: []
      }
      horoscope_cache: {
        Row: {
          area: string
          content: Json
          created_at: string
          id: string
          model: string
          period_start: string
          scope: string
          sun_sign: string
        }
        Insert: {
          area: string
          content: Json
          created_at?: string
          id?: string
          model?: string
          period_start: string
          scope: string
          sun_sign: string
        }
        Update: {
          area?: string
          content?: Json
          created_at?: string
          id?: string
          model?: string
          period_start?: string
          scope?: string
          sun_sign?: string
        }
        Relationships: []
      }
      legal_consents: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          id: string
          ip_hash: string
          user_agent: string | null
          user_id: string | null
          version: string
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted: boolean
          id?: string
          ip_hash: string
          user_agent?: string | null
          user_id?: string | null
          version: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          id?: string
          ip_hash?: string
          user_agent?: string | null
          user_id?: string | null
          version?: string
        }
        Relationships: []
      }
      natal_charts: {
        Row: {
          aspects: Json | null
          created_at: string
          houses: Json
          id: string
          interpretation: string
          is_full: boolean
          planets: Json
          user_id: string
        }
        Insert: {
          aspects?: Json | null
          created_at?: string
          houses: Json
          id?: string
          interpretation: string
          is_full?: boolean
          planets: Json
          user_id: string
        }
        Update: {
          aspects?: Json | null
          created_at?: string
          houses?: Json
          id?: string
          interpretation?: string
          is_full?: boolean
          planets?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string
          birth_lat: number | null
          birth_lng: number | null
          birth_place: string | null
          birth_time: string | null
          created_at: string
          display_name: string
          id: string
          marketing_emails: boolean
          sun_sign: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date: string
          birth_lat?: number | null
          birth_lng?: number | null
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string
          display_name: string
          id: string
          marketing_emails?: boolean
          sun_sign: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string
          birth_lat?: number | null
          birth_lng?: number | null
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string
          display_name?: string
          id?: string
          marketing_emails?: boolean
          sun_sign?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sign_compatibility: {
        Row: {
          content: Json
          created_at: string
          score: number
          sign_a: string
          sign_b: string
        }
        Insert: {
          content: Json
          created_at?: string
          score: number
          sign_a: string
          sign_b: string
        }
        Update: {
          content?: Json
          created_at?: string
          score?: number
          sign_a?: string
          sign_b?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          current_streak: number
          last_visit: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_visit?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          last_visit?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          id: string
          received_at: string
          type: string
        }
        Insert: {
          id: string
          received_at?: string
          type: string
        }
        Update: {
          id?: string
          received_at?: string
          type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          plan: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tarot_readings: {
        Row: {
          cards: Json
          created_at: string
          id: string
          interpretation: string
          is_premium_spread: boolean
          question: string | null
          spread_type: string
          user_id: string
        }
        Insert: {
          cards: Json
          created_at?: string
          id?: string
          interpretation: string
          is_premium_spread?: boolean
          question?: string | null
          spread_type: string
          user_id: string
        }
        Update: {
          cards?: Json
          created_at?: string
          id?: string
          interpretation?: string
          is_premium_spread?: boolean
          question?: string | null
          spread_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string
          event: string
          id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_zodiac_sign: { Args: { birth: string }; Returns: string }
      increment_streak: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
