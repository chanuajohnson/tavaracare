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
      feature_upvotes: {
        Row: {
          feature_id: string
          id: string
          upvoted_at: string | null
          user_id: string | null
        }
        Insert: {
          feature_id: string
          id?: string
          upvoted_at?: string | null
          user_id?: string | null
        }
        Update: {
          feature_id?: string
          id?: string
          upvoted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
        Relationships: []
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
        ]
      }
      profiles: {
        Row: {
          additional_notes: string | null
          address: string | null
          avatar_url: string | null
          budget_preferences: string | null
          care_recipient_name: string | null
          care_schedule: string | null
          care_types: string[] | null
          caregiver_preferences: string | null
          caregiver_type: string | null
          caregiving_areas: string[] | null
          caregiving_experience: string | null
          communication_channels: string[] | null
          community_motivation: string | null
          community_roles: string[] | null
          contribution_interests: string[] | null
          created_at: string | null
          emergency_contact: string | null
          enable_community_notifications: boolean | null
          full_name: string | null
          id: string
          improvement_ideas: string | null
          involvement_preferences: string[] | null
          list_in_community_directory: boolean | null
          location: string | null
          other_special_needs: string | null
          phone_number: string | null
          preferred_contact_method: string | null
          relationship: string | null
          role: Database["public"]["Enums"]["user_role"]
          special_needs: string[] | null
          specialized_care: string[] | null
          tech_interests: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          additional_notes?: string | null
          address?: string | null
          avatar_url?: string | null
          budget_preferences?: string | null
          care_recipient_name?: string | null
          care_schedule?: string | null
          care_types?: string[] | null
          caregiver_preferences?: string | null
          caregiver_type?: string | null
          caregiving_areas?: string[] | null
          caregiving_experience?: string | null
          communication_channels?: string[] | null
          community_motivation?: string | null
          community_roles?: string[] | null
          contribution_interests?: string[] | null
          created_at?: string | null
          emergency_contact?: string | null
          enable_community_notifications?: boolean | null
          full_name?: string | null
          id: string
          improvement_ideas?: string | null
          involvement_preferences?: string[] | null
          list_in_community_directory?: boolean | null
          location?: string | null
          other_special_needs?: string | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          relationship?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          special_needs?: string[] | null
          specialized_care?: string[] | null
          tech_interests?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          additional_notes?: string | null
          address?: string | null
          avatar_url?: string | null
          budget_preferences?: string | null
          care_recipient_name?: string | null
          care_schedule?: string | null
          care_types?: string[] | null
          caregiver_preferences?: string | null
          caregiver_type?: string | null
          caregiving_areas?: string[] | null
          caregiving_experience?: string | null
          communication_channels?: string[] | null
          community_motivation?: string | null
          community_roles?: string[] | null
          contribution_interests?: string[] | null
          created_at?: string | null
          emergency_contact?: string | null
          enable_community_notifications?: boolean | null
          full_name?: string | null
          id?: string
          improvement_ideas?: string | null
          involvement_preferences?: string[] | null
          list_in_community_directory?: boolean | null
          location?: string | null
          other_special_needs?: string | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          relationship?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          special_needs?: string[] | null
          specialized_care?: string[] | null
          tech_interests?: string[] | null
          updated_at?: string | null
          website?: string | null
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
      admin_delete_user: {
        Args: {
          target_user_id: string
        }
        Returns: undefined
      }
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
      user_role: "family" | "professional" | "community" | "admin"
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
