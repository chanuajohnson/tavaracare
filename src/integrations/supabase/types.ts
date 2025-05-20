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
      calendar_events: {
        Row: {
          calendar_id: string
          care_shift_id: string | null
          created_at: string | null
          etag: string | null
          google_event_id: string
          id: string
          last_synced: string | null
          sync_token: string | null
          updated_at: string | null
        }
        Insert: {
          calendar_id: string
          care_shift_id?: string | null
          created_at?: string | null
          etag?: string | null
          google_event_id: string
          id?: string
          last_synced?: string | null
          sync_token?: string | null
          updated_at?: string | null
        }
        Update: {
          calendar_id?: string
          care_shift_id?: string | null
          created_at?: string | null
          etag?: string | null
          google_event_id?: string
          id?: string
          last_synced?: string | null
          sync_token?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_care_shift_id_fkey"
            columns: ["care_shift_id"]
            isOneToOne: false
            referencedRelation: "care_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      care_plans: {
        Row: {
          created_at: string | null
          description: string | null
          family_id: string
          id: string
          metadata: Json | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          family_id: string
          id?: string
          metadata?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          family_id?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_plans_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_recipient_profiles: {
        Row: {
          birth_year: string
          career_fields: string[] | null
          caregiver_personality: string[] | null
          challenges: string[] | null
          created_at: string | null
          cultural_preferences: string | null
          daily_routines: string | null
          family_social_info: string | null
          full_name: string
          hobbies_interests: string[] | null
          id: string
          joyful_things: string | null
          last_updated: string | null
          life_story: string | null
          notable_events: string | null
          personality_traits: string[] | null
          sensitivities: string | null
          specific_requests: string | null
          unique_facts: string | null
          user_id: string
        }
        Insert: {
          birth_year: string
          career_fields?: string[] | null
          caregiver_personality?: string[] | null
          challenges?: string[] | null
          created_at?: string | null
          cultural_preferences?: string | null
          daily_routines?: string | null
          family_social_info?: string | null
          full_name: string
          hobbies_interests?: string[] | null
          id?: string
          joyful_things?: string | null
          last_updated?: string | null
          life_story?: string | null
          notable_events?: string | null
          personality_traits?: string[] | null
          sensitivities?: string | null
          specific_requests?: string | null
          unique_facts?: string | null
          user_id: string
        }
        Update: {
          birth_year?: string
          career_fields?: string[] | null
          caregiver_personality?: string[] | null
          challenges?: string[] | null
          created_at?: string | null
          cultural_preferences?: string | null
          daily_routines?: string | null
          family_social_info?: string | null
          full_name?: string
          hobbies_interests?: string[] | null
          id?: string
          joyful_things?: string | null
          last_updated?: string | null
          life_story?: string | null
          notable_events?: string | null
          personality_traits?: string[] | null
          sensitivities?: string | null
          specific_requests?: string | null
          unique_facts?: string | null
          user_id?: string
        }
        Relationships: []
      }
      care_shifts: {
        Row: {
          care_plan_id: string | null
          caregiver_id: string | null
          created_at: string | null
          description: string | null
          end_time: string
          family_id: string
          google_calendar_event_id: string | null
          id: string
          location: string | null
          recurrence_rule: string | null
          recurring_pattern: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          care_plan_id?: string | null
          caregiver_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          family_id: string
          google_calendar_event_id?: string | null
          id?: string
          location?: string | null
          recurrence_rule?: string | null
          recurring_pattern?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          care_plan_id?: string | null
          caregiver_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          family_id?: string
          google_calendar_event_id?: string | null
          id?: string
          location?: string | null
          recurrence_rule?: string | null
          recurring_pattern?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_shifts_care_plan_id_fkey"
            columns: ["care_plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_shifts_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_shifts_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_tasks: {
        Row: {
          assigned_to: string | null
          care_plan_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          care_plan_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          care_plan_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_tasks_care_plan_id_fkey"
            columns: ["care_plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      care_team_members: {
        Row: {
          care_plan_id: string | null
          caregiver_id: string
          created_at: string | null
          display_name: string | null
          family_id: string
          id: string
          notes: string | null
          overtime_rate: number | null
          regular_rate: number | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          care_plan_id?: string | null
          caregiver_id: string
          created_at?: string | null
          display_name?: string | null
          family_id: string
          id?: string
          notes?: string | null
          overtime_rate?: number | null
          regular_rate?: number | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          care_plan_id?: string | null
          caregiver_id?: string
          created_at?: string | null
          display_name?: string | null
          family_id?: string
          id?: string
          notes?: string | null
          overtime_rate?: number | null
          regular_rate?: number | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_team_members_care_plan_id_fkey"
            columns: ["care_plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_team_members_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_team_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_conversations: {
        Row: {
          care_needs: Json | null
          contact_info: Json | null
          conversation_data: Json
          converted_to_registration: boolean | null
          created_at: string
          handoff_requested: boolean | null
          id: string
          lead_score: number | null
          qualification_status: string | null
          session_id: string
          updated_at: string
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          care_needs?: Json | null
          contact_info?: Json | null
          conversation_data?: Json
          converted_to_registration?: boolean | null
          created_at?: string
          handoff_requested?: boolean | null
          id?: string
          lead_score?: number | null
          qualification_status?: string | null
          session_id: string
          updated_at?: string
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          care_needs?: Json | null
          contact_info?: Json | null
          conversation_data?: Json
          converted_to_registration?: boolean | null
          created_at?: string
          handoff_requested?: boolean | null
          id?: string
          lead_score?: number | null
          qualification_status?: string | null
          session_id?: string
          updated_at?: string
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      chatbot_messages: {
        Row: {
          context_data: Json | null
          conversation_id: string | null
          id: string
          message: string
          message_type: string | null
          sender_type: string
          timestamp: string
        }
        Insert: {
          context_data?: Json | null
          conversation_id?: string | null
          id?: string
          message: string
          message_type?: string | null
          sender_type: string
          timestamp?: string
        }
        Update: {
          context_data?: Json | null
          conversation_id?: string | null
          id?: string
          message?: string
          message_type?: string | null
          sender_type?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_progress: {
        Row: {
          created_at: string | null
          current_section: string
          form_data: Json | null
          id: string
          last_question_id: string | null
          registration_prefilled: boolean | null
          responses_complete: boolean | null
          role: string
          section_status: Database["public"]["Enums"]["section_status"] | null
          session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_section: string
          form_data?: Json | null
          id?: string
          last_question_id?: string | null
          registration_prefilled?: boolean | null
          responses_complete?: boolean | null
          role: string
          section_status?: Database["public"]["Enums"]["section_status"] | null
          session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_section?: string
          form_data?: Json | null
          id?: string
          last_question_id?: string | null
          registration_prefilled?: boolean | null
          responses_complete?: boolean | null
          role?: string
          section_status?: Database["public"]["Enums"]["section_status"] | null
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chatbot_responses: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          response: Json | null
          role: string
          section: string
          session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          response?: Json | null
          role: string
          section: string
          session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          response?: Json | null
          role?: string
          section?: string
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cta_engagement_tracking: {
        Row: {
          action_type: string
          additional_data: Json | null
          created_at: string | null
          feature_name: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          additional_data?: Json | null
          created_at?: string | null
          feature_name?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          additional_data?: Json | null
          created_at?: string | null
          feature_name?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_interest_tracking: {
        Row: {
          action_type: string | null
          additional_info: Json | null
          clicked_at: string | null
          feature_name: string
          id: string
          source_page: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action_type?: string | null
          additional_info?: Json | null
          clicked_at?: string | null
          feature_name: string
          id?: string
          source_page?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string | null
          additional_info?: Json | null
          clicked_at?: string | null
          feature_name?: string
          id?: string
          source_page?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      holidays: {
        Row: {
          created_at: string | null
          date: string
          id: string
          name: string
          pay_multiplier: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          name: string
          pay_multiplier?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          name?: string
          pay_multiplier?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      job_opportunities: {
        Row: {
          details: string | null
          id: string
          location: string
          match_percentage: number | null
          posted_at: string | null
          salary: string | null
          source_name: string | null
          source_url: string | null
          tags: string[] | null
          title: string
          type: string
          urgency: string | null
        }
        Insert: {
          details?: string | null
          id?: string
          location: string
          match_percentage?: number | null
          posted_at?: string | null
          salary?: string | null
          source_name?: string | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          type: string
          urgency?: string | null
        }
        Update: {
          details?: string | null
          id?: string
          location?: string
          match_percentage?: number | null
          posted_at?: string | null
          salary?: string | null
          source_name?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          urgency?: string | null
        }
        Relationships: []
      }
      lesson_content_blocks: {
        Row: {
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          id: string
          lesson_id: string | null
          order_index: number
        }
        Insert: {
          content: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          order_index: number
        }
        Update: {
          content?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_content_blocks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "module_lessons"
            referencedColumns: ["id"]
          },
        ]
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
      message_board_posts: {
        Row: {
          author: string
          author_initial: string
          care_needs: string[] | null
          details: string | null
          id: string
          location: string
          specialties: string[] | null
          time_posted: string | null
          title: string
          type: string
          urgency: string | null
        }
        Insert: {
          author: string
          author_initial: string
          care_needs?: string[] | null
          details?: string | null
          id?: string
          location: string
          specialties?: string[] | null
          time_posted?: string | null
          title: string
          type: string
          urgency?: string | null
        }
        Update: {
          author?: string
          author_initial?: string
          care_needs?: string[] | null
          details?: string | null
          id?: string
          location?: string
          specialties?: string[] | null
          time_posted?: string | null
          title?: string
          type?: string
          urgency?: string | null
        }
        Relationships: []
      }
      module_lessons: {
        Row: {
          content: string
          created_at: string | null
          id: string
          module_id: string | null
          order_index: number
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          module_id?: string | null
          order_index: number
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          module_id?: string | null
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          provider: string
          provider_subscription_id: string | null
          provider_transaction_id: string | null
          status: string
          subscription_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          provider?: string
          provider_subscription_id?: string | null
          provider_transaction_id?: string | null
          status?: string
          subscription_id?: string | null
          transaction_type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          provider?: string
          provider_subscription_id?: string | null
          provider_transaction_id?: string | null
          status?: string
          subscription_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_entries: {
        Row: {
          care_plan_id: string
          care_team_member_id: string
          created_at: string | null
          entered_at: string | null
          expense_total: number | null
          holiday_hours: number | null
          holiday_rate: number | null
          id: string
          overtime_hours: number | null
          overtime_rate: number | null
          pay_period_end: string | null
          pay_period_start: string | null
          payment_date: string | null
          payment_status: string | null
          regular_hours: number
          regular_rate: number
          total_amount: number
          updated_at: string | null
          work_log_id: string
        }
        Insert: {
          care_plan_id: string
          care_team_member_id: string
          created_at?: string | null
          entered_at?: string | null
          expense_total?: number | null
          holiday_hours?: number | null
          holiday_rate?: number | null
          id?: string
          overtime_hours?: number | null
          overtime_rate?: number | null
          pay_period_end?: string | null
          pay_period_start?: string | null
          payment_date?: string | null
          payment_status?: string | null
          regular_hours: number
          regular_rate: number
          total_amount: number
          updated_at?: string | null
          work_log_id: string
        }
        Update: {
          care_plan_id?: string
          care_team_member_id?: string
          created_at?: string | null
          entered_at?: string | null
          expense_total?: number | null
          holiday_hours?: number | null
          holiday_rate?: number | null
          id?: string
          overtime_hours?: number | null
          overtime_rate?: number | null
          pay_period_end?: string | null
          pay_period_start?: string | null
          payment_date?: string | null
          payment_status?: string | null
          regular_hours?: number
          regular_rate?: number
          total_amount?: number
          updated_at?: string | null
          work_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entries_care_plan_id_fkey"
            columns: ["care_plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_entries_care_team_member_id_fkey"
            columns: ["care_team_member_id"]
            isOneToOne: false
            referencedRelation: "care_team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_entries_work_log_id_fkey"
            columns: ["work_log_id"]
            isOneToOne: false
            referencedRelation: "work_logs"
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
        ]
      }
      professional_locations: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          latitude: number
          longitude: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          latitude: number
          longitude: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          additional_notes: string | null
          additional_professional_notes: string | null
          address: string | null
          administers_medication: boolean | null
          availability: string[] | null
          avatar_url: string | null
          background_check: boolean | null
          background_check_proof_url: string | null
          bio: string | null
          budget_preferences: string | null
          care_recipient_name: string | null
          care_schedule: string | null
          care_services: string[] | null
          care_types: string[] | null
          caregiver_preferences: string | null
          caregiver_type: string | null
          caregiving_areas: string[] | null
          caregiving_experience: string | null
          certification_proof_url: string | null
          certifications: string[] | null
          communication_channels: string[] | null
          community_motivation: string | null
          community_roles: string[] | null
          commute_mode: string | null
          contribution_interests: string[] | null
          created_at: string | null
          custom_availability_alerts: string | null
          custom_schedule: string | null
          emergency_contact: string | null
          enable_community_notifications: boolean | null
          enable_job_alerts: boolean | null
          expected_rate: string | null
          first_name: string | null
          full_name: string | null
          handles_medical_equipment: boolean | null
          has_liability_insurance: boolean | null
          hourly_rate: string | null
          id: string
          improvement_ideas: string | null
          involvement_preferences: string[] | null
          job_matching_criteria: string[] | null
          job_notification_method: string | null
          languages: string[] | null
          last_name: string | null
          legally_authorized: boolean | null
          license_number: string | null
          list_in_community_directory: boolean | null
          list_in_directory: boolean | null
          location: string | null
          medical_conditions_experience: string[] | null
          onboarding_progress: Json | null
          other_certification: string | null
          other_medical_condition: string | null
          other_special_needs: string | null
          payment_methods: string[] | null
          phone_number: string | null
          preferred_contact_method: string | null
          preferred_work_locations: string | null
          professional_type: string | null
          provides_housekeeping: boolean | null
          provides_transportation: boolean | null
          registration_skipped: boolean | null
          relationship: string | null
          role: Database["public"]["Enums"]["user_role"]
          special_needs: string[] | null
          specialized_care: string[] | null
          tech_interests: string[] | null
          updated_at: string | null
          website: string | null
          why_choose_caregiving: string | null
          work_type: string | null
          years_of_experience: string | null
        }
        Insert: {
          additional_notes?: string | null
          additional_professional_notes?: string | null
          address?: string | null
          administers_medication?: boolean | null
          availability?: string[] | null
          avatar_url?: string | null
          background_check?: boolean | null
          background_check_proof_url?: string | null
          bio?: string | null
          budget_preferences?: string | null
          care_recipient_name?: string | null
          care_schedule?: string | null
          care_services?: string[] | null
          care_types?: string[] | null
          caregiver_preferences?: string | null
          caregiver_type?: string | null
          caregiving_areas?: string[] | null
          caregiving_experience?: string | null
          certification_proof_url?: string | null
          certifications?: string[] | null
          communication_channels?: string[] | null
          community_motivation?: string | null
          community_roles?: string[] | null
          commute_mode?: string | null
          contribution_interests?: string[] | null
          created_at?: string | null
          custom_availability_alerts?: string | null
          custom_schedule?: string | null
          emergency_contact?: string | null
          enable_community_notifications?: boolean | null
          enable_job_alerts?: boolean | null
          expected_rate?: string | null
          first_name?: string | null
          full_name?: string | null
          handles_medical_equipment?: boolean | null
          has_liability_insurance?: boolean | null
          hourly_rate?: string | null
          id: string
          improvement_ideas?: string | null
          involvement_preferences?: string[] | null
          job_matching_criteria?: string[] | null
          job_notification_method?: string | null
          languages?: string[] | null
          last_name?: string | null
          legally_authorized?: boolean | null
          license_number?: string | null
          list_in_community_directory?: boolean | null
          list_in_directory?: boolean | null
          location?: string | null
          medical_conditions_experience?: string[] | null
          onboarding_progress?: Json | null
          other_certification?: string | null
          other_medical_condition?: string | null
          other_special_needs?: string | null
          payment_methods?: string[] | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          preferred_work_locations?: string | null
          professional_type?: string | null
          provides_housekeeping?: boolean | null
          provides_transportation?: boolean | null
          registration_skipped?: boolean | null
          relationship?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          special_needs?: string[] | null
          specialized_care?: string[] | null
          tech_interests?: string[] | null
          updated_at?: string | null
          website?: string | null
          why_choose_caregiving?: string | null
          work_type?: string | null
          years_of_experience?: string | null
        }
        Update: {
          additional_notes?: string | null
          additional_professional_notes?: string | null
          address?: string | null
          administers_medication?: boolean | null
          availability?: string[] | null
          avatar_url?: string | null
          background_check?: boolean | null
          background_check_proof_url?: string | null
          bio?: string | null
          budget_preferences?: string | null
          care_recipient_name?: string | null
          care_schedule?: string | null
          care_services?: string[] | null
          care_types?: string[] | null
          caregiver_preferences?: string | null
          caregiver_type?: string | null
          caregiving_areas?: string[] | null
          caregiving_experience?: string | null
          certification_proof_url?: string | null
          certifications?: string[] | null
          communication_channels?: string[] | null
          community_motivation?: string | null
          community_roles?: string[] | null
          commute_mode?: string | null
          contribution_interests?: string[] | null
          created_at?: string | null
          custom_availability_alerts?: string | null
          custom_schedule?: string | null
          emergency_contact?: string | null
          enable_community_notifications?: boolean | null
          enable_job_alerts?: boolean | null
          expected_rate?: string | null
          first_name?: string | null
          full_name?: string | null
          handles_medical_equipment?: boolean | null
          has_liability_insurance?: boolean | null
          hourly_rate?: string | null
          id?: string
          improvement_ideas?: string | null
          involvement_preferences?: string[] | null
          job_matching_criteria?: string[] | null
          job_notification_method?: string | null
          languages?: string[] | null
          last_name?: string | null
          legally_authorized?: boolean | null
          license_number?: string | null
          list_in_community_directory?: boolean | null
          list_in_directory?: boolean | null
          location?: string | null
          medical_conditions_experience?: string[] | null
          onboarding_progress?: Json | null
          other_certification?: string | null
          other_medical_condition?: string | null
          other_special_needs?: string | null
          payment_methods?: string[] | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          preferred_work_locations?: string | null
          professional_type?: string | null
          provides_housekeeping?: boolean | null
          provides_transportation?: boolean | null
          registration_skipped?: boolean | null
          relationship?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          special_needs?: string[] | null
          specialized_care?: string[] | null
          tech_interests?: string[] | null
          updated_at?: string | null
          website?: string | null
          why_choose_caregiving?: string | null
          work_type?: string | null
          years_of_experience?: string | null
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
      registration_progress: {
        Row: {
          care_type: string[] | null
          completed_step_count: number | null
          completed_steps: Json
          created_at: string
          current_step: string
          device_info: Json | null
          email: string | null
          id: string
          last_active_at: string
          referral_source: string | null
          registration_data: Json
          session_id: string | null
          status: Database["public"]["Enums"]["registration_status"]
          total_steps: number | null
          updated_at: string
          urgency: Database["public"]["Enums"]["care_urgency"] | null
          user_id: string | null
        }
        Insert: {
          care_type?: string[] | null
          completed_step_count?: number | null
          completed_steps?: Json
          created_at?: string
          current_step?: string
          device_info?: Json | null
          email?: string | null
          id?: string
          last_active_at?: string
          referral_source?: string | null
          registration_data?: Json
          session_id?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          total_steps?: number | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["care_urgency"] | null
          user_id?: string | null
        }
        Update: {
          care_type?: string[] | null
          completed_step_count?: number | null
          completed_steps?: Json
          created_at?: string
          current_step?: string
          device_info?: Json | null
          email?: string | null
          id?: string
          last_active_at?: string
          referral_source?: string | null
          registration_data?: Json
          session_id?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          total_steps?: number | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["care_urgency"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          created_at: string
          id: string
          message: string
          request_type: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          request_type: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          request_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      training_modules: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_time: string
          icon: string
          id: string
          order_index: number
          title: string
          total_lessons: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_time: string
          icon: string
          id?: string
          order_index: number
          title: string
          total_lessons: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_time?: string
          icon?: string
          id?: string
          order_index?: number
          title?: string
          total_lessons?: number
        }
        Relationships: []
      }
      user_events: {
        Row: {
          additional_data: Json | null
          event_timestamp: string | null
          event_type: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          additional_data?: Json | null
          event_timestamp?: string | null
          event_type?: string | null
          id?: never
          user_id?: string | null
        }
        Update: {
          additional_data?: Json | null
          event_timestamp?: string | null
          event_type?: string | null
          id?: never
          user_id?: string | null
        }
        Relationships: []
      }
      user_journey: {
        Row: {
          event_data: Json | null
          event_timestamp: string | null
          event_type: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          event_data?: Json | null
          event_timestamp?: string | null
          event_type?: string | null
          id?: never
          user_id?: string | null
        }
        Update: {
          event_data?: Json | null
          event_timestamp?: string | null
          event_type?: string | null
          id?: never
          user_id?: string | null
        }
        Relationships: []
      }
      user_module_progress: {
        Row: {
          completed_lessons: number | null
          created_at: string | null
          id: string
          last_accessed: string | null
          module_id: string | null
          status: Database["public"]["Enums"]["module_status"] | null
          user_id: string | null
        }
        Insert: {
          completed_lessons?: number | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          module_id?: string | null
          status?: Database["public"]["Enums"]["module_status"] | null
          user_id?: string | null
        }
        Update: {
          completed_lessons?: number | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          module_id?: string | null
          status?: Database["public"]["Enums"]["module_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          last_payment_date: string | null
          next_payment_date: string | null
          payment_method: string | null
          paypal_order_id: string | null
          paypal_payer_id: string | null
          paypal_subscription_id: string | null
          plan_id: string
          start_date: string | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          paypal_subscription_id?: string | null
          plan_id: string
          start_date?: string | null
          status?: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          paypal_subscription_id?: string | null
          plan_id?: string
          start_date?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          processed: boolean
          processed_at: string | null
          provider: string
          raw_data: Json
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          provider?: string
          raw_data: Json
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          provider?: string
          raw_data?: Json
        }
        Relationships: []
      }
      work_log_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          id: string
          receipt_url: string | null
          status: string
          updated_at: string | null
          work_log_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description: string
          id?: string
          receipt_url?: string | null
          status?: string
          updated_at?: string | null
          work_log_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          receipt_url?: string | null
          status?: string
          updated_at?: string | null
          work_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_log_expenses_work_log_id_fkey"
            columns: ["work_log_id"]
            isOneToOne: false
            referencedRelation: "work_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      work_logs: {
        Row: {
          base_rate: number | null
          care_plan_id: string
          care_team_member_id: string
          created_at: string | null
          end_time: string
          id: string
          notes: string | null
          rate_multiplier: number | null
          rate_type: string | null
          shift_id: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          base_rate?: number | null
          care_plan_id: string
          care_team_member_id: string
          created_at?: string | null
          end_time: string
          id?: string
          notes?: string | null
          rate_multiplier?: number | null
          rate_type?: string | null
          shift_id?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          base_rate?: number | null
          care_plan_id?: string
          care_team_member_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          rate_multiplier?: number | null
          rate_type?: string | null
          shift_id?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_logs_care_plan_id_fkey"
            columns: ["care_plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_logs_care_team_member_id_fkey"
            columns: ["care_team_member_id"]
            isOneToOne: false
            referencedRelation: "care_team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_logs_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "care_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      daily_pmf_metrics: {
        Row: {
          daily_retained_users: number | null
          date: string | null
          family_active_users: number | null
          family_dashboard_views: number | null
          family_new_signups: number | null
          matching_clicks_family: number | null
          professional_active_users: number | null
          professional_new_signups: number | null
          subscription_clicks_family: number | null
          unlock_clicks_family: number | null
        }
        Relationships: []
      }
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
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_feature_vote_count: {
        Args: { feature_id: string }
        Returns: number
      }
      has_user_voted_for_feature: {
        Args: { feature_id: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      care_urgency:
        | "immediate"
        | "within_week"
        | "within_month"
        | "planning_ahead"
      chatbot_message_type: "text" | "option" | "handoff" | "form"
      chatbot_sender_type: "user" | "bot" | "human_agent"
      chatbot_status: "active" | "completed" | "abandoned"
      content_type: "text" | "image" | "video"
      feature_status:
        | "planned"
        | "in_development"
        | "ready_for_demo"
        | "launched"
      lead_quality: "high" | "medium" | "low" | "unqualified"
      meal_type:
        | "morning_drink"
        | "breakfast"
        | "morning_snack"
        | "lunch"
        | "afternoon_snack"
        | "dinner"
      module_status: "not_started" | "in_progress" | "completed"
      registration_status: "started" | "in_progress" | "completed" | "abandoned"
      section_status: "not_started" | "in_progress" | "completed"
      user_role: "family" | "professional" | "community" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      care_urgency: [
        "immediate",
        "within_week",
        "within_month",
        "planning_ahead",
      ],
      chatbot_message_type: ["text", "option", "handoff", "form"],
      chatbot_sender_type: ["user", "bot", "human_agent"],
      chatbot_status: ["active", "completed", "abandoned"],
      content_type: ["text", "image", "video"],
      feature_status: [
        "planned",
        "in_development",
        "ready_for_demo",
        "launched",
      ],
      lead_quality: ["high", "medium", "low", "unqualified"],
      meal_type: [
        "morning_drink",
        "breakfast",
        "morning_snack",
        "lunch",
        "afternoon_snack",
        "dinner",
      ],
      module_status: ["not_started", "in_progress", "completed"],
      registration_status: ["started", "in_progress", "completed", "abandoned"],
      section_status: ["not_started", "in_progress", "completed"],
      user_role: ["family", "professional", "community", "admin"],
    },
  },
} as const
