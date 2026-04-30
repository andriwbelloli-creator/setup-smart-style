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
      ai_analyses: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          overall_score: number | null
          owner_id: string | null
          scores: Json
          setup_id: string | null
          tips: Json
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          overall_score?: number | null
          owner_id?: string | null
          scores?: Json
          setup_id?: string | null
          tips?: Json
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          overall_score?: number | null
          owner_id?: string | null
          scores?: Json
          setup_id?: string | null
          tips?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_setup_id_fkey"
            columns: ["setup_id"]
            isOneToOne: false
            referencedRelation: "setups"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          setup_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          setup_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          setup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_setup_id_fkey"
            columns: ["setup_id"]
            isOneToOne: false
            referencedRelation: "setups"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          setup_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          setup_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          setup_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_setup_id_fkey"
            columns: ["setup_id"]
            isOneToOne: false
            referencedRelation: "setups"
            referencedColumns: ["id"]
          },
        ]
      }
      product_alternatives: {
        Row: {
          affiliate_url: string | null
          created_at: string
          id: string
          name: string
          price_brl: number
          product_id: string
          store: Database["public"]["Enums"]["product_store"]
        }
        Insert: {
          affiliate_url?: string | null
          created_at?: string
          id?: string
          name: string
          price_brl?: number
          product_id: string
          store?: Database["public"]["Enums"]["product_store"]
        }
        Update: {
          affiliate_url?: string | null
          created_at?: string
          id?: string
          name?: string
          price_brl?: number
          product_id?: string
          store?: Database["public"]["Enums"]["product_store"]
        }
        Relationships: [
          {
            foreignKeyName: "product_alternatives_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "setup_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          career: Database["public"]["Enums"]["user_career"] | null
          city: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          career?: Database["public"]["Enums"]["user_career"] | null
          city?: string | null
          created_at?: string
          display_name: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          career?: Database["public"]["Enums"]["user_career"] | null
          city?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      saves: {
        Row: {
          created_at: string
          setup_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          setup_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          setup_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saves_setup_id_fkey"
            columns: ["setup_id"]
            isOneToOne: false
            referencedRelation: "setups"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_images: {
        Row: {
          created_at: string
          id: string
          is_after: boolean
          is_before: boolean
          position: number
          setup_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_after?: boolean
          is_before?: boolean
          position?: number
          setup_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_after?: boolean
          is_before?: boolean
          position?: number
          setup_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "setup_images_setup_id_fkey"
            columns: ["setup_id"]
            isOneToOne: false
            referencedRelation: "setups"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_products: {
        Row: {
          affiliate_url: string | null
          brand: string | null
          category: string
          created_at: string
          id: string
          name: string
          position: number
          price_brl: number
          rating: number | null
          setup_id: string
          store: Database["public"]["Enums"]["product_store"]
          x: number
          y: number
        }
        Insert: {
          affiliate_url?: string | null
          brand?: string | null
          category: string
          created_at?: string
          id?: string
          name: string
          position?: number
          price_brl?: number
          rating?: number | null
          setup_id: string
          store?: Database["public"]["Enums"]["product_store"]
          x?: number
          y?: number
        }
        Update: {
          affiliate_url?: string | null
          brand?: string | null
          category?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          price_brl?: number
          rating?: number | null
          setup_id?: string
          store?: Database["public"]["Enums"]["product_store"]
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "setup_products_setup_id_fkey"
            columns: ["setup_id"]
            isOneToOne: false
            referencedRelation: "setups"
            referencedColumns: ["id"]
          },
        ]
      }
      setups: {
        Row: {
          ai_score: number | null
          budget_brl: number
          career: Database["public"]["Enums"]["user_career"] | null
          city: string | null
          cover_url: string | null
          created_at: string
          description: string
          id: string
          likes_count: number
          owner_id: string
          saves_count: number
          slug: string
          status: Database["public"]["Enums"]["setup_status"]
          styles: string[]
          title: string
          updated_at: string
        }
        Insert: {
          ai_score?: number | null
          budget_brl?: number
          career?: Database["public"]["Enums"]["user_career"] | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          likes_count?: number
          owner_id: string
          saves_count?: number
          slug: string
          status?: Database["public"]["Enums"]["setup_status"]
          styles?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          ai_score?: number | null
          budget_brl?: number
          career?: Database["public"]["Enums"]["user_career"] | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          likes_count?: number
          owner_id?: string
          saves_count?: number
          slug?: string
          status?: Database["public"]["Enums"]["setup_status"]
          styles?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      product_store:
        | "amazon_br"
        | "mercado_livre"
        | "kabum"
        | "magalu"
        | "pichau"
        | "outro"
      setup_status: "draft" | "published"
      user_career: "dev" | "designer" | "pm" | "creator" | "remoto" | "outro"
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
      product_store: [
        "amazon_br",
        "mercado_livre",
        "kabum",
        "magalu",
        "pichau",
        "outro",
      ],
      setup_status: ["draft", "published"],
      user_career: ["dev", "designer", "pm", "creator", "remoto", "outro"],
    },
  },
} as const
