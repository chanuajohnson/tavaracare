export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      feature_votes: {
        Row: {
          created_at: string
          feature_id: string | null
          feedback: string | null
          id: string
          user_email: string
          user_id: string | null
          user_type: string
        }
        Insert: {
          created_at?: string
          feature_id?: string | null
          feedback?: string | null
          id?: string
          user_email: string
          user_id?: string | null
          user_type: string
        }
        Update: {
          created_at?: string
          feature_id?: string | null
          feedback?: string | null
          id?: string
          user_email?: string
          user_id?: string | null
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_votes_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_votes_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_votes_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          created_at: string
          description: string
          id: string
          status: Database["public"]["Enums"]["feature_status"] | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          status?: Database["public"]["Enums"]["feature_status"] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["feature_status"] | null
          title?: string
        }
        Relationships: []
      }
      meal_plan_items: {
        Row: {
          created_at: string
          id: string
          meal_plan_id: string
          meal_type: string
          recipe_id: string
          scheduled_for: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_plan_id: string
          meal_type: string
          recipe_id: string
          scheduled_for: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_plan_id?: string
          meal_type?: string
          recipe_id?: string
          scheduled_for?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          end_date: string
          id: string
          start_date: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prepped_meal_orders: {
        Row: {
          created_at: string
          delivery_date: string
          id: string
          quantity: number
          recipe_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_date: string
          id?: string
          quantity: number
          recipe_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_date?: string
          id?: string
          quantity?: number
          recipe_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prepped_meal_orders_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prepped_meal_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          ingredients: Json
          instructions: string[] | null
          nutrition_info: Json | null
          preparation_time: number | null
          servings: number | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          ingredients?: Json
          instructions?: string[] | null
          nutrition_info?: Json | null
          preparation_time?: number | null
          servings?: number | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          ingredients?: Json
          instructions?: string[] | null
          nutrition_info?: Json | null
          preparation_time?: number | null
          servings?: number | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      feature_lookup: {
        Row: {
          id: string | null
          title: string | null
        }
        Insert: {
          id?: string | null
          title?: string | null
        }
        Update: {
          id?: string | null
          title?: string | null
        }
        Relationships: []
      }
      feature_statistics: {
        Row: {
          description: string | null
          id: string | null
          status: Database["public"]["Enums"]["feature_status"] | null
          title: string | null
          vote_count: number | null
          voted_users: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_feature_vote_count: {
        Args: {
          feature_id: string
        }
        Returns: number
      }
      has_user_voted_for_feature: {
        Args: {
          feature_id: string
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      feature_status:
        | "planned"
        | "in_development"
        | "ready_for_demo"
        | "launched"
      meal_type:
        | "morning_drink"
        | "breakfast"
        | "morning_snack"
        | "lunch"
        | "afternoon_snack"
        | "dinner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
