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
      daily_tasks: {
        Row: {
          assignee: string | null
          created_at: string
          created_by: string
          detail: string | null
          done: boolean
          id: string
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          created_by: string
          detail?: string | null
          done?: boolean
          id?: string
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          created_at?: string
          created_by?: string
          detail?: string | null
          done?: boolean
          id?: string
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          fu_stage: string
          id: string
          last_activity: string | null
          leader: string
          nama: string
          next_follow_up: string | null
          notes: Json
          pic: string
          priority: string
          produk: string | null
          ringkasan: string | null
          source: string | null
          stage: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fu_stage?: string
          id: string
          last_activity?: string | null
          leader: string
          nama: string
          next_follow_up?: string | null
          notes?: Json
          pic: string
          priority?: string
          produk?: string | null
          ringkasan?: string | null
          source?: string | null
          stage?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fu_stage?: string
          id?: string
          last_activity?: string | null
          leader?: string
          nama?: string
          next_follow_up?: string | null
          notes?: Json
          pic?: string
          priority?: string
          produk?: string | null
          ringkasan?: string | null
          source?: string | null
          stage?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      rhythms: {
        Row: {
          created_at: string
          id: string
          label: string
          position: number
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          position?: number
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          position?: number
          type?: string
        }
        Relationships: []
      }
      rm_activities: {
        Row: {
          created_at: string
          datetime: string
          description: string
          done: boolean
          hasil: string | null
          id: string
          jenis: string
          lead_id: string | null
          lead_name: string | null
          leader: string
          photos: Json
          rm: string
        }
        Insert: {
          created_at?: string
          datetime?: string
          description: string
          done?: boolean
          hasil?: string | null
          id?: string
          jenis: string
          lead_id?: string | null
          lead_name?: string | null
          leader: string
          photos?: Json
          rm: string
        }
        Update: {
          created_at?: string
          datetime?: string
          description?: string
          done?: boolean
          hasil?: string | null
          id?: string
          jenis?: string
          lead_id?: string | null
          lead_name?: string | null
          leader?: string
          photos?: Json
          rm?: string
        }
        Relationships: []
      }
      rm_notifications: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message: string
          read_at: string | null
          rm_name: string
          source: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          read_at?: string | null
          rm_name: string
          source?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          read_at?: string | null
          rm_name?: string
          source?: string
        }
        Relationships: []
      }
      task_notes: {
        Row: {
          created_at: string
          id: string
          leader_name: string
          message: string
          read_at: string | null
          read_by: string | null
          rm_name: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          leader_name: string
          message: string
          read_at?: string | null
          read_by?: string | null
          rm_name: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          leader_name?: string
          message?: string
          read_at?: string | null
          read_by?: string | null
          rm_name?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
