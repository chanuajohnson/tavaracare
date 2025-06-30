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
      admin_availability_slots: {
        Row: {
          admin_id: string | null
          config_id: string | null
          created_at: string
          created_by: string | null
          current_bookings: number
          date: string
          description: string | null
          end_time: string
          id: string
          is_available: boolean
          is_blocked: boolean | null
          is_default_slot: boolean | null
          max_bookings: number
          slot_type: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          config_id?: string | null
          created_at?: string
          created_by?: string | null
          current_bookings?: number
          date: string
          description?: string | null
          end_time: string
          id?: string
          is_available?: boolean
          is_blocked?: boolean | null
          is_default_slot?: boolean | null
          max_bookings?: number
          slot_type?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          config_id?: string | null
          created_at?: string
          created_by?: string | null
          current_bookings?: number
          date?: string
          description?: string | null
          end_time?: string
          id?: string
          is_available?: boolean
          is_blocked?: boolean | null
          is_default_slot?: boolean | null
          max_bookings?: number
          slot_type?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_availability_slots_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "admin_visit_config"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_blocked_dates: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_blocked_dates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_communications: {
        Row: {
          admin_id: string
          created_at: string | null
          custom_message: string | null
          delivery_status: string | null
          id: string
          message_type: string
          response_received: boolean | null
          sent_at: string | null
          target_user_id: string
          template_id: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          custom_message?: string | null
          delivery_status?: string | null
          id?: string
          message_type: string
          response_received?: boolean | null
          sent_at?: string | null
          target_user_id: string
          template_id?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          custom_message?: string | null
          delivery_status?: string | null
          id?: string
          message_type?: string
          response_received?: boolean | null
          sent_at?: string | null
          target_user_id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_communications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_communications_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_communications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "nudge_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_visit_config: {
        Row: {
          advance_booking_days: number
          available_days: string[]
          created_at: string | null
          end_time: string
          id: string
          max_bookings_per_day: number
          start_time: string
          updated_at: string | null
        }
        Insert: {
          advance_booking_days?: number
          available_days?: string[]
          created_at?: string | null
          end_time?: string
          id?: string
          max_bookings_per_day?: number
          start_time?: string
          updated_at?: string | null
        }
        Update: {
          advance_booking_days?: number
          available_days?: string[]
          created_at?: string | null
          end_time?: string
          id?: string
          max_bookings_per_day?: number
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_aggregations: {
        Row: {
          aggregation_period: string
          breakdown: Json | null
          created_at: string | null
          id: string
          metric_name: string
          metric_type: string
          period_end: string
          period_start: string
          value: number | null
        }
        Insert: {
          aggregation_period: string
          breakdown?: Json | null
          created_at?: string | null
          id?: string
          metric_name: string
          metric_type: string
          period_end: string
          period_start: string
          value?: number | null
        }
        Update: {
          aggregation_period?: string
          breakdown?: Json | null
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_type?: string
          period_end?: string
          period_start?: string
          value?: number | null
        }
        Relationships: []
      }
      assistant_nudges: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          message: string
          sender: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          message: string
          sender?: string
          status?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          message?: string
          sender?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      care_needs_family: {
        Row: {
          additional_notes: string | null
          assistance_bathing: boolean | null
          assistance_companionship: boolean | null
          assistance_dressing: boolean | null
          assistance_feeding: boolean | null
          assistance_medication: boolean | null
          assistance_mobility: boolean | null
          assistance_naps: boolean | null
          assistance_oral_care: boolean | null
          assistance_toileting: boolean | null
          care_location: string | null
          care_recipient_name: string | null
          checkin_preference: string | null
          chronic_illness_type: string | null
          cognitive_notes: string | null
          communication_method: string | null
          created_at: string | null
          cultural_preferences: string | null
          daily_report_required: boolean | null
          dementia_redirection: boolean | null
          diagnosed_conditions: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          emergency_plan: string | null
          equipment_use: boolean | null
          escort_to_appointments: boolean | null
          fall_monitoring: boolean | null
          fresh_air_walks: boolean | null
          gentle_engagement: boolean | null
          grocery_runs: boolean | null
          id: string
          known_allergies: string | null
          laundry_support: boolean | null
          meal_prep: boolean | null
          memory_reminders: boolean | null
          plan_type: string | null
          preferred_days: string[] | null
          preferred_time_end: string | null
          preferred_time_start: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          profile_id: string | null
          tidy_room: boolean | null
          triggers_soothing_techniques: string | null
          updated_at: string | null
          vitals_check: boolean | null
          wandering_prevention: boolean | null
          weekday_coverage: string | null
          weekend_coverage: string | null
          weekend_schedule_type: string | null
        }
        Insert: {
          additional_notes?: string | null
          assistance_bathing?: boolean | null
          assistance_companionship?: boolean | null
          assistance_dressing?: boolean | null
          assistance_feeding?: boolean | null
          assistance_medication?: boolean | null
          assistance_mobility?: boolean | null
          assistance_naps?: boolean | null
          assistance_oral_care?: boolean | null
          assistance_toileting?: boolean | null
          care_location?: string | null
          care_recipient_name?: string | null
          checkin_preference?: string | null
          chronic_illness_type?: string | null
          cognitive_notes?: string | null
          communication_method?: string | null
          created_at?: string | null
          cultural_preferences?: string | null
          daily_report_required?: boolean | null
          dementia_redirection?: boolean | null
          diagnosed_conditions?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          emergency_plan?: string | null
          equipment_use?: boolean | null
          escort_to_appointments?: boolean | null
          fall_monitoring?: boolean | null
          fresh_air_walks?: boolean | null
          gentle_engagement?: boolean | null
          grocery_runs?: boolean | null
          id?: string
          known_allergies?: string | null
          laundry_support?: boolean | null
          meal_prep?: boolean | null
          memory_reminders?: boolean | null
          plan_type?: string | null
          preferred_days?: string[] | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          profile_id?: string | null
          tidy_room?: boolean | null
          triggers_soothing_techniques?: string | null
          updated_at?: string | null
          vitals_check?: boolean | null
          wandering_prevention?: boolean | null
          weekday_coverage?: string | null
          weekend_coverage?: string | null
          weekend_schedule_type?: string | null
        }
        Update: {
          additional_notes?: string | null
          assistance_bathing?: boolean | null
          assistance_companionship?: boolean | null
          assistance_dressing?: boolean | null
          assistance_feeding?: boolean | null
          assistance_medication?: boolean | null
          assistance_mobility?: boolean | null
          assistance_naps?: boolean | null
          assistance_oral_care?: boolean | null
          assistance_toileting?: boolean | null
          care_location?: string | null
          care_recipient_name?: string | null
          checkin_preference?: string | null
          chronic_illness_type?: string | null
          cognitive_notes?: string | null
          communication_method?: string | null
          created_at?: string | null
          cultural_preferences?: string | null
          daily_report_required?: boolean | null
          dementia_redirection?: boolean | null
          diagnosed_conditions?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          emergency_plan?: string | null
          equipment_use?: boolean | null
          escort_to_appointments?: boolean | null
          fall_monitoring?: boolean | null
          fresh_air_walks?: boolean | null
          gentle_engagement?: boolean | null
          grocery_runs?: boolean | null
          id?: string
          known_allergies?: string | null
          laundry_support?: boolean | null
          meal_prep?: boolean | null
          memory_reminders?: boolean | null
          plan_type?: string | null
          preferred_days?: string[] | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          profile_id?: string | null
          tidy_room?: boolean | null
          triggers_soothing_techniques?: string | null
          updated_at?: string | null
          vitals_check?: boolean | null
          wandering_prevention?: boolean | null
          weekday_coverage?: string | null
          weekend_coverage?: string | null
          weekend_schedule_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_needs_family_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      caregiver_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_tav_moderated: boolean
          is_user: boolean
          message_type: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_tav_moderated?: boolean
          is_user: boolean
          message_type?: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_tav_moderated?: boolean
          is_user?: boolean
          message_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "caregiver_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_chat_requests: {
        Row: {
          accepted_at: string | null
          caregiver_id: string
          created_at: string | null
          declined_at: string | null
          family_user_id: string
          id: string
          initial_message: string
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          caregiver_id: string
          created_at?: string | null
          declined_at?: string | null
          family_user_id: string
          id?: string
          initial_message: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          caregiver_id?: string
          created_at?: string | null
          declined_at?: string | null
          family_user_id?: string
          id?: string
          initial_message?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_caregiver_chat_requests_caregiver_id"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_chat_sessions: {
        Row: {
          caregiver_id: string
          created_at: string
          family_user_id: string
          id: string
          is_premium: boolean
          max_daily_messages: number
          messages_sent: number
          session_date: string
          updated_at: string
        }
        Insert: {
          caregiver_id: string
          created_at?: string
          family_user_id: string
          id?: string
          is_premium?: boolean
          max_daily_messages?: number
          messages_sent?: number
          session_date?: string
          updated_at?: string
        }
        Update: {
          caregiver_id?: string
          created_at?: string
          family_user_id?: string
          id?: string
          is_premium?: boolean
          max_daily_messages?: number
          messages_sent?: number
          session_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      caregiver_notifications: {
        Row: {
          caregiver_id: string
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          read_at: string | null
          title: string
        }
        Insert: {
          caregiver_id: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type?: string
          read_at?: string | null
          title: string
        }
        Update: {
          caregiver_id?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          read_at?: string | null
          title?: string
        }
        Relationships: []
      }
      chat_conversation_flows: {
        Row: {
          created_at: string | null
          current_stage: string
          id: string
          session_id: string
          stage_data: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_stage?: string
          id?: string
          session_id: string
          stage_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_stage?: string
          id?: string
          session_id?: string
          stage_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_prompt_templates: {
        Row: {
          category: string
          context_requirements: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          prompt_text: string
          stage: string
        }
        Insert: {
          category: string
          context_requirements?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          prompt_text: string
          stage: string
        }
        Update: {
          category?: string
          context_requirements?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          prompt_text?: string
          stage?: string
        }
        Relationships: []
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
      customer_health_scores: {
        Row: {
          churn_risk_level: string | null
          created_at: string | null
          engagement_score: number
          id: string
          key_insights: string[] | null
          last_calculated_at: string
          next_review_at: string | null
          overall_score: number
          recommended_actions: string[] | null
          satisfaction_score: number
          support_score: number
          trend_direction: string | null
          updated_at: string | null
          usage_score: number
          user_id: string | null
        }
        Insert: {
          churn_risk_level?: string | null
          created_at?: string | null
          engagement_score: number
          id?: string
          key_insights?: string[] | null
          last_calculated_at?: string
          next_review_at?: string | null
          overall_score: number
          recommended_actions?: string[] | null
          satisfaction_score: number
          support_score: number
          trend_direction?: string | null
          updated_at?: string | null
          usage_score: number
          user_id?: string | null
        }
        Update: {
          churn_risk_level?: string | null
          created_at?: string | null
          engagement_score?: number
          id?: string
          key_insights?: string[] | null
          last_calculated_at?: string
          next_review_at?: string | null
          overall_score?: number
          recommended_actions?: string[] | null
          satisfaction_score?: number
          support_score?: number
          trend_direction?: string | null
          updated_at?: string | null
          usage_score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_health_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_tav_moderated: boolean
          is_user: boolean
          message_type: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_tav_moderated?: boolean
          is_user: boolean
          message_type?: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_tav_moderated?: boolean
          is_user?: boolean
          message_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "family_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      family_chat_requests: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          declined_at: string | null
          family_user_id: string
          id: string
          initial_message: string
          professional_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          declined_at?: string | null
          family_user_id: string
          id?: string
          initial_message: string
          professional_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          declined_at?: string | null
          family_user_id?: string
          id?: string
          initial_message?: string
          professional_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      family_chat_sessions: {
        Row: {
          created_at: string | null
          family_user_id: string
          id: string
          is_premium: boolean
          max_daily_messages: number
          messages_sent: number
          professional_id: string
          session_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          family_user_id: string
          id?: string
          is_premium?: boolean
          max_daily_messages?: number
          messages_sent?: number
          professional_id: string
          session_date?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          family_user_id?: string
          id?: string
          is_premium?: boolean
          max_daily_messages?: number
          messages_sent?: number
          professional_id?: string
          session_date?: string
          updated_at?: string | null
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
      feedback_sentiment_history: {
        Row: {
          analysis_model: string | null
          analyzed_at: string
          confidence_score: number | null
          created_at: string | null
          emotions: Json | null
          feedback_id: string | null
          id: string
          keywords: string[] | null
          sentiment_label: string
          sentiment_score: number
        }
        Insert: {
          analysis_model?: string | null
          analyzed_at?: string
          confidence_score?: number | null
          created_at?: string | null
          emotions?: Json | null
          feedback_id?: string | null
          id?: string
          keywords?: string[] | null
          sentiment_label: string
          sentiment_score: number
        }
        Update: {
          analysis_model?: string | null
          analyzed_at?: string
          confidence_score?: number | null
          created_at?: string | null
          emotions?: Json | null
          feedback_id?: string | null
          id?: string
          keywords?: string[] | null
          sentiment_label?: string
          sentiment_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "feedback_sentiment_history_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "user_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_completions: {
        Row: {
          additional_data: Json | null
          completed_at: string
          conversion_path: string[] | null
          created_at: string | null
          goal_name: string
          goal_type: string
          id: string
          session_id: string
          time_to_complete_seconds: number | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          additional_data?: Json | null
          completed_at?: string
          conversion_path?: string[] | null
          created_at?: string | null
          goal_name: string
          goal_type: string
          id?: string
          session_id: string
          time_to_complete_seconds?: number | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          additional_data?: Json | null
          completed_at?: string
          conversion_path?: string[] | null
          created_at?: string | null
          goal_name?: string
          goal_type?: string
          id?: string
          session_id?: string
          time_to_complete_seconds?: number | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_items: {
        Row: {
          brand: string | null
          category: string
          created_at: string | null
          description: string | null
          estimated_price: number | null
          grocery_list_id: string
          id: string
          is_completed: boolean | null
          item_name: string
          notes: string | null
          preferred_store: string | null
          priority: number | null
          quantity: string | null
          size_weight: string | null
          store_section: string | null
          substitutes: string | null
          updated_at: string | null
          urgency_level: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          estimated_price?: number | null
          grocery_list_id: string
          id?: string
          is_completed?: boolean | null
          item_name: string
          notes?: string | null
          preferred_store?: string | null
          priority?: number | null
          quantity?: string | null
          size_weight?: string | null
          store_section?: string | null
          substitutes?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_price?: number | null
          grocery_list_id?: string
          id?: string
          is_completed?: boolean | null
          item_name?: string
          notes?: string | null
          preferred_store?: string | null
          priority?: number | null
          quantity?: string | null
          size_weight?: string | null
          store_section?: string | null
          substitutes?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grocery_items_grocery_list_id_fkey"
            columns: ["grocery_list_id"]
            isOneToOne: false
            referencedRelation: "grocery_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_lists: {
        Row: {
          care_plan_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          is_template: boolean | null
          name: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          care_plan_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          care_plan_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_lists_care_plan_id_fkey"
            columns: ["care_plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_shares: {
        Row: {
          can_edit: boolean | null
          created_at: string | null
          expires_at: string | null
          grocery_list_id: string
          id: string
          share_token: string
          shared_by: string
        }
        Insert: {
          can_edit?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          grocery_list_id: string
          id?: string
          share_token: string
          shared_by: string
        }
        Update: {
          can_edit?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          grocery_list_id?: string
          id?: string
          share_token?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_shares_grocery_list_id_fkey"
            columns: ["grocery_list_id"]
            isOneToOne: false
            referencedRelation: "grocery_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_videos: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          duration_seconds: number | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_active: boolean | null
          mime_type: string | null
          thumbnail_path: string | null
          title: string
          updated_at: string | null
          upload_status: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          thumbnail_path?: string | null
          title: string
          updated_at?: string | null
          upload_status?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          thumbnail_path?: string | null
          title?: string
          updated_at?: string | null
          upload_status?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_videos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      journey_analytics: {
        Row: {
          action_type: string
          additional_data: Json | null
          completion_time_seconds: number | null
          created_at: string | null
          id: string
          journey_step_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          additional_data?: Json | null
          completion_time_seconds?: number | null
          created_at?: string | null
          id?: string
          journey_step_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          additional_data?: Json | null
          completion_time_seconds?: number | null
          created_at?: string | null
          id?: string
          journey_step_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_analytics_journey_step_id_fkey"
            columns: ["journey_step_id"]
            isOneToOne: false
            referencedRelation: "journey_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_step_content: {
        Row: {
          content: string
          content_type: string
          created_at: string | null
          display_order: number | null
          id: string
          is_visible: boolean | null
          journey_step_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          journey_step_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          journey_step_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_step_content_journey_step_id_fkey"
            columns: ["journey_step_id"]
            isOneToOne: false
            referencedRelation: "journey_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_step_paths: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_recommended: boolean | null
          path_color: string | null
          path_description: string | null
          path_name: string
          step_ids: Json
          updated_at: string | null
          user_role: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_recommended?: boolean | null
          path_color?: string | null
          path_description?: string | null
          path_name: string
          step_ids: Json
          updated_at?: string | null
          user_role: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_recommended?: boolean | null
          path_color?: string | null
          path_description?: string | null
          path_name?: string
          step_ids?: Json
          updated_at?: string | null
          user_role?: string
        }
        Relationships: []
      }
      journey_steps: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          detailed_explanation: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_optional: boolean | null
          link_path: string | null
          order_index: number
          prerequisites: Json | null
          step_number: number
          time_estimate_minutes: number | null
          title: string
          tooltip_content: string | null
          updated_at: string | null
          user_role: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          detailed_explanation?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_optional?: boolean | null
          link_path?: string | null
          order_index: number
          prerequisites?: Json | null
          step_number: number
          time_estimate_minutes?: number | null
          title: string
          tooltip_content?: string | null
          updated_at?: string | null
          user_role: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          detailed_explanation?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_optional?: boolean | null
          link_path?: string | null
          order_index?: number
          prerequisites?: Json | null
          step_number?: number
          time_estimate_minutes?: number | null
          title?: string
          tooltip_content?: string | null
          updated_at?: string | null
          user_role?: string
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
          notes: string | null
          recipe_id: string
          scheduled_for: string
          serving_size: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          meal_plan_id: string
          meal_type: string
          notes?: string | null
          recipe_id: string
          scheduled_for: string
          serving_size?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          meal_plan_id?: string
          meal_type?: string
          notes?: string | null
          recipe_id?: string
          scheduled_for?: string
          serving_size?: number | null
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
          care_plan_id: string
          created_at: string
          end_date: string
          id: string
          start_date: string
          title: string
        }
        Insert: {
          care_plan_id: string
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          title: string
        }
        Update: {
          care_plan_id?: string
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_care_plan_id_fkey"
            columns: ["care_plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_administrations: {
        Row: {
          administered_at: string
          administered_by: string | null
          administered_by_role: string | null
          conflict_detected: boolean | null
          conflict_resolution_method: string | null
          conflict_resolved_at: string | null
          created_at: string | null
          id: string
          medication_id: string
          notes: string | null
          original_administration_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          administered_at: string
          administered_by?: string | null
          administered_by_role?: string | null
          conflict_detected?: boolean | null
          conflict_resolution_method?: string | null
          conflict_resolved_at?: string | null
          created_at?: string | null
          id?: string
          medication_id: string
          notes?: string | null
          original_administration_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          administered_at?: string
          administered_by?: string | null
          administered_by_role?: string | null
          conflict_detected?: boolean | null
          conflict_resolution_method?: string | null
          conflict_resolved_at?: string | null
          created_at?: string | null
          id?: string
          medication_id?: string
          notes?: string | null
          original_administration_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_administrations_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_original_administration_id_fkey"
            columns: ["original_administration_id"]
            isOneToOne: false
            referencedRelation: "medication_administrations"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          care_plan_id: string
          created_at: string | null
          dosage: string | null
          id: string
          instructions: string | null
          medication_type: string | null
          name: string
          prescription_terms: string | null
          schedule: Json | null
          special_instructions: string | null
          term_definitions: Json | null
          updated_at: string | null
        }
        Insert: {
          care_plan_id: string
          created_at?: string | null
          dosage?: string | null
          id?: string
          instructions?: string | null
          medication_type?: string | null
          name: string
          prescription_terms?: string | null
          schedule?: Json | null
          special_instructions?: string | null
          term_definitions?: Json | null
          updated_at?: string | null
        }
        Update: {
          care_plan_id?: string
          created_at?: string | null
          dosage?: string | null
          id?: string
          instructions?: string | null
          medication_type?: string | null
          name?: string
          prescription_terms?: string | null
          schedule?: Json | null
          special_instructions?: string | null
          term_definitions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_care_plan_id_fkey"
            columns: ["care_plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
        ]
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
      nudge_templates: {
        Row: {
          created_at: string | null
          id: string
          message_template: string
          message_type: string
          name: string
          role: string
          stage: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_template: string
          message_type: string
          name: string
          role: string
          stage: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message_template?: string
          message_type?: string
          name?: string
          role?: string
          stage?: string
          updated_at?: string | null
        }
        Relationships: []
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
      professional_documents: {
        Row: {
          created_at: string
          document_subtype: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          updated_at: string
          user_id: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_subtype?: string | null
          document_type?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_subtype?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
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
          admin_scheduling_requested_at: string | null
          administers_medication: boolean | null
          availability: string[] | null
          avatar_url: string | null
          background_check: boolean | null
          background_check_proof_url: string | null
          background_check_status: string | null
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
          email_verification_sent_at: string | null
          email_verified: boolean | null
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
          journey_stage_updated_at: string | null
          languages: string[] | null
          last_login_at: string | null
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
          preferred_visit_type: string | null
          preferred_work_locations: string | null
          professional_type: string | null
          provides_housekeeping: boolean | null
          provides_transportation: boolean | null
          ready_for_admin_scheduling: boolean | null
          registration_skipped: boolean | null
          relationship: string | null
          role: Database["public"]["Enums"]["user_role"]
          special_needs: string[] | null
          specialized_care: string[] | null
          tech_interests: string[] | null
          updated_at: string | null
          verification_badge_earned_at: string | null
          video_available: boolean | null
          visit_notes: string | null
          visit_payment_reference: string | null
          visit_payment_status: string | null
          visit_scheduled_date: string | null
          visit_scheduling_status: string | null
          website: string | null
          whatsapp_linked_at: string | null
          whatsapp_phone: string | null
          whatsapp_verified: boolean | null
          why_choose_caregiving: string | null
          work_type: string | null
          years_of_experience: string | null
        }
        Insert: {
          additional_notes?: string | null
          additional_professional_notes?: string | null
          address?: string | null
          admin_scheduling_requested_at?: string | null
          administers_medication?: boolean | null
          availability?: string[] | null
          avatar_url?: string | null
          background_check?: boolean | null
          background_check_proof_url?: string | null
          background_check_status?: string | null
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
          email_verification_sent_at?: string | null
          email_verified?: boolean | null
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
          journey_stage_updated_at?: string | null
          languages?: string[] | null
          last_login_at?: string | null
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
          preferred_visit_type?: string | null
          preferred_work_locations?: string | null
          professional_type?: string | null
          provides_housekeeping?: boolean | null
          provides_transportation?: boolean | null
          ready_for_admin_scheduling?: boolean | null
          registration_skipped?: boolean | null
          relationship?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          special_needs?: string[] | null
          specialized_care?: string[] | null
          tech_interests?: string[] | null
          updated_at?: string | null
          verification_badge_earned_at?: string | null
          video_available?: boolean | null
          visit_notes?: string | null
          visit_payment_reference?: string | null
          visit_payment_status?: string | null
          visit_scheduled_date?: string | null
          visit_scheduling_status?: string | null
          website?: string | null
          whatsapp_linked_at?: string | null
          whatsapp_phone?: string | null
          whatsapp_verified?: boolean | null
          why_choose_caregiving?: string | null
          work_type?: string | null
          years_of_experience?: string | null
        }
        Update: {
          additional_notes?: string | null
          additional_professional_notes?: string | null
          address?: string | null
          admin_scheduling_requested_at?: string | null
          administers_medication?: boolean | null
          availability?: string[] | null
          avatar_url?: string | null
          background_check?: boolean | null
          background_check_proof_url?: string | null
          background_check_status?: string | null
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
          email_verification_sent_at?: string | null
          email_verified?: boolean | null
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
          journey_stage_updated_at?: string | null
          languages?: string[] | null
          last_login_at?: string | null
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
          preferred_visit_type?: string | null
          preferred_work_locations?: string | null
          professional_type?: string | null
          provides_housekeeping?: boolean | null
          provides_transportation?: boolean | null
          ready_for_admin_scheduling?: boolean | null
          registration_skipped?: boolean | null
          relationship?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          special_needs?: string[] | null
          specialized_care?: string[] | null
          tech_interests?: string[] | null
          updated_at?: string | null
          verification_badge_earned_at?: string | null
          video_available?: boolean | null
          visit_notes?: string | null
          visit_payment_reference?: string | null
          visit_payment_status?: string | null
          visit_scheduled_date?: string | null
          visit_scheduling_status?: string | null
          website?: string | null
          whatsapp_linked_at?: string | null
          whatsapp_phone?: string | null
          whatsapp_verified?: boolean | null
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
      session_analytics: {
        Row: {
          bounce_rate: number | null
          browser: string | null
          created_at: string | null
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          exit_page: string | null
          goal_completions: number | null
          id: string
          interactions_count: number | null
          page_views: number | null
          referrer: string | null
          session_data: Json | null
          session_id: string
          started_at: string
          user_id: string | null
        }
        Insert: {
          bounce_rate?: number | null
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          exit_page?: string | null
          goal_completions?: number | null
          id?: string
          interactions_count?: number | null
          page_views?: number | null
          referrer?: string | null
          session_data?: Json | null
          session_id: string
          started_at?: string
          user_id?: string | null
        }
        Update: {
          bounce_rate?: number | null
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          exit_page?: string | null
          goal_completions?: number | null
          id?: string
          interactions_count?: number | null
          page_views?: number | null
          referrer?: string | null
          session_data?: Json | null
          session_id?: string
          started_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_coverage_claims: {
        Row: {
          claimed_at: string
          claiming_caregiver_id: string
          coverage_request_id: string
          created_at: string
          family_confirmed_at: string | null
          family_confirmed_by: string | null
          id: string
          status: Database["public"]["Enums"]["coverage_claim_status"]
          updated_at: string
        }
        Insert: {
          claimed_at?: string
          claiming_caregiver_id: string
          coverage_request_id: string
          created_at?: string
          family_confirmed_at?: string | null
          family_confirmed_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["coverage_claim_status"]
          updated_at?: string
        }
        Update: {
          claimed_at?: string
          claiming_caregiver_id?: string
          coverage_request_id?: string
          created_at?: string
          family_confirmed_at?: string | null
          family_confirmed_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["coverage_claim_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_coverage_claims_claiming_caregiver_id_fkey"
            columns: ["claiming_caregiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_coverage_claims_coverage_request_id_fkey"
            columns: ["coverage_request_id"]
            isOneToOne: false
            referencedRelation: "shift_coverage_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_coverage_claims_family_confirmed_by_fkey"
            columns: ["family_confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_coverage_requests: {
        Row: {
          created_at: string
          expires_at: string
          family_response_at: string | null
          family_response_by: string | null
          id: string
          reason: string
          request_message: string | null
          requested_at: string
          requesting_caregiver_id: string
          shift_id: string
          status: Database["public"]["Enums"]["coverage_request_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          family_response_at?: string | null
          family_response_by?: string | null
          id?: string
          reason: string
          request_message?: string | null
          requested_at?: string
          requesting_caregiver_id: string
          shift_id: string
          status?: Database["public"]["Enums"]["coverage_request_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          family_response_at?: string | null
          family_response_by?: string | null
          id?: string
          reason?: string
          request_message?: string | null
          requested_at?: string
          requesting_caregiver_id?: string
          shift_id?: string
          status?: Database["public"]["Enums"]["coverage_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_coverage_requests_family_response_by_fkey"
            columns: ["family_response_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_coverage_requests_requesting_caregiver_id_fkey"
            columns: ["requesting_caregiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_coverage_requests_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "care_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_notifications: {
        Row: {
          coverage_request_id: string | null
          created_at: string
          delivery_status: Database["public"]["Enums"]["delivery_status"]
          id: string
          message_content: string | null
          notification_type: Database["public"]["Enums"]["shift_notification_type"]
          sent_at: string
          sent_to: string
          shift_id: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          coverage_request_id?: string | null
          created_at?: string
          delivery_status?: Database["public"]["Enums"]["delivery_status"]
          id?: string
          message_content?: string | null
          notification_type: Database["public"]["Enums"]["shift_notification_type"]
          sent_at?: string
          sent_to: string
          shift_id?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          coverage_request_id?: string | null
          created_at?: string
          delivery_status?: Database["public"]["Enums"]["delivery_status"]
          id?: string
          message_content?: string | null
          notification_type?: Database["public"]["Enums"]["shift_notification_type"]
          sent_at?: string
          sent_to?: string
          shift_id?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_notifications_coverage_request_id_fkey"
            columns: ["coverage_request_id"]
            isOneToOne: false
            referencedRelation: "shift_coverage_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_notifications_sent_to_fkey"
            columns: ["sent_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_notifications_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "care_shifts"
            referencedColumns: ["id"]
          },
        ]
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
      user_cohorts: {
        Row: {
          assigned_at: string
          cohort_data: Json | null
          cohort_name: string
          cohort_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string
          cohort_data?: Json | null
          cohort_name: string
          cohort_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string
          cohort_data?: Json | null
          cohort_name?: string
          cohort_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_cohorts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_feedback: {
        Row: {
          category: string | null
          contact_info: Json | null
          created_at: string
          feedback_type: string
          id: string
          keywords: string[] | null
          message: string
          metadata: Json | null
          priority: string
          rating: number | null
          response_time_hours: number | null
          satisfaction_prediction: number | null
          sentiment_label: string | null
          sentiment_score: number | null
          status: string
          subject: string
          updated_at: string
          urgency_score: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          contact_info?: Json | null
          created_at?: string
          feedback_type: string
          id?: string
          keywords?: string[] | null
          message: string
          metadata?: Json | null
          priority?: string
          rating?: number | null
          response_time_hours?: number | null
          satisfaction_prediction?: number | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          status?: string
          subject: string
          updated_at?: string
          urgency_score?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          contact_info?: Json | null
          created_at?: string
          feedback_type?: string
          id?: string
          keywords?: string[] | null
          message?: string
          metadata?: Json | null
          priority?: string
          rating?: number | null
          response_time_hours?: number | null
          satisfaction_prediction?: number | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          status?: string
          subject?: string
          updated_at?: string
          urgency_score?: number | null
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
      user_journey_funnels: {
        Row: {
          additional_data: Json | null
          completed_at: string | null
          conversion_time_seconds: number | null
          created_at: string | null
          entered_at: string
          funnel_name: string
          id: string
          session_id: string
          stage_name: string
          stage_order: number
          user_id: string | null
        }
        Insert: {
          additional_data?: Json | null
          completed_at?: string | null
          conversion_time_seconds?: number | null
          created_at?: string | null
          entered_at?: string
          funnel_name: string
          id?: string
          session_id: string
          stage_name: string
          stage_order: number
          user_id?: string | null
        }
        Update: {
          additional_data?: Json | null
          completed_at?: string | null
          conversion_time_seconds?: number | null
          created_at?: string | null
          entered_at?: string
          funnel_name?: string
          id?: string
          session_id?: string
          stage_name?: string
          stage_order?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_funnels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journey_progress: {
        Row: {
          completed_steps: Json | null
          completion_percentage: number | null
          created_at: string | null
          current_step: number | null
          id: string
          last_activity_at: string | null
          role: string
          total_steps: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_steps?: Json | null
          completion_percentage?: number | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          last_activity_at?: string | null
          role: string
          total_steps: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_steps?: Json | null
          completion_percentage?: number | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          last_activity_at?: string | null
          role?: string
          total_steps?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      visit_bookings: {
        Row: {
          admin_notes: string | null
          admin_status: Database["public"]["Enums"]["admin_status_enum"] | null
          availability_slot_id: string
          booking_date: string
          booking_time: string
          cancellation_reason: string | null
          cancelled_at: string | null
          confirmation_sent: boolean
          created_at: string
          family_address: string | null
          family_phone: string | null
          id: string
          is_cancelled: boolean | null
          nurse_assigned: string | null
          original_booking_date: string | null
          original_booking_time: string | null
          payment_amount: number | null
          payment_currency: string | null
          payment_reference: string | null
          payment_status: string | null
          reschedule_count: number | null
          reschedule_reason: string | null
          status: string
          updated_at: string
          user_full_name: string | null
          user_id: string
          user_notes: string | null
          user_whatsapp: string | null
          visit_notes: Json | null
          visit_type: string
        }
        Insert: {
          admin_notes?: string | null
          admin_status?: Database["public"]["Enums"]["admin_status_enum"] | null
          availability_slot_id: string
          booking_date: string
          booking_time: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmation_sent?: boolean
          created_at?: string
          family_address?: string | null
          family_phone?: string | null
          id?: string
          is_cancelled?: boolean | null
          nurse_assigned?: string | null
          original_booking_date?: string | null
          original_booking_time?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          reschedule_count?: number | null
          reschedule_reason?: string | null
          status?: string
          updated_at?: string
          user_full_name?: string | null
          user_id: string
          user_notes?: string | null
          user_whatsapp?: string | null
          visit_notes?: Json | null
          visit_type?: string
        }
        Update: {
          admin_notes?: string | null
          admin_status?: Database["public"]["Enums"]["admin_status_enum"] | null
          availability_slot_id?: string
          booking_date?: string
          booking_time?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmation_sent?: boolean
          created_at?: string
          family_address?: string | null
          family_phone?: string | null
          id?: string
          is_cancelled?: boolean | null
          nurse_assigned?: string | null
          original_booking_date?: string | null
          original_booking_time?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          reschedule_count?: number | null
          reschedule_reason?: string | null
          status?: string
          updated_at?: string
          user_full_name?: string | null
          user_id?: string
          user_notes?: string | null
          user_whatsapp?: string | null
          visit_notes?: Json | null
          visit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_visit_bookings_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_bookings_availability_slot_id_fkey"
            columns: ["availability_slot_id"]
            isOneToOne: false
            referencedRelation: "admin_availability_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_bookings_nurse_assigned_fkey"
            columns: ["nurse_assigned"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      whatsapp_auth: {
        Row: {
          code_expires_at: string | null
          country_code: string
          created_at: string | null
          formatted_number: string
          id: string
          is_verified: boolean | null
          last_verification_attempt: string | null
          phone_number: string
          updated_at: string | null
          user_metadata: Json | null
          verification_attempts: number | null
          verification_code: string | null
        }
        Insert: {
          code_expires_at?: string | null
          country_code?: string
          created_at?: string | null
          formatted_number: string
          id?: string
          is_verified?: boolean | null
          last_verification_attempt?: string | null
          phone_number: string
          updated_at?: string | null
          user_metadata?: Json | null
          verification_attempts?: number | null
          verification_code?: string | null
        }
        Update: {
          code_expires_at?: string | null
          country_code?: string
          created_at?: string | null
          formatted_number?: string
          id?: string
          is_verified?: boolean | null
          last_verification_attempt?: string | null
          phone_number?: string
          updated_at?: string | null
          user_metadata?: Json | null
          verification_attempts?: number | null
          verification_code?: string | null
        }
        Relationships: []
      }
      whatsapp_message_log: {
        Row: {
          content: string
          created_at: string
          delivery_status: string | null
          direction: string
          id: string
          message_id: string | null
          message_type: string
          phone_number: string
          processed: boolean
          processed_at: string | null
          status: string | null
          template_name: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          delivery_status?: string | null
          direction: string
          id?: string
          message_id?: string | null
          message_type: string
          phone_number: string
          processed?: boolean
          processed_at?: string | null
          status?: string | null
          template_name?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          delivery_status?: string | null
          direction?: string
          id?: string
          message_id?: string | null
          message_type?: string
          phone_number?: string
          processed?: boolean
          processed_at?: string | null
          status?: string | null
          template_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_message_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          phone_number: string
          session_token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          phone_number: string
          session_token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string
          session_token?: string
          updated_at?: string | null
          user_id?: string | null
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
      calculate_customer_health_score: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      cancel_visit_booking: {
        Args: { booking_id: string; reason?: string }
        Returns: undefined
      }
      cleanup_expired_whatsapp_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_medication_conflicts: {
        Args: {
          p_medication_id: string
          p_administered_at: string
          p_time_window_hours?: number
        }
        Returns: {
          id: string
          administered_at: string
          administered_by: string
          administered_by_role: string
          status: string
          notes: string
        }[]
      }
      format_whatsapp_number: {
        Args: { phone_input: string; country_code_input?: string }
        Returns: string
      }
      generate_admin_configured_slots: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_default_availability_slots: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_feature_vote_count: {
        Args: { feature_id: string }
        Returns: number
      }
      has_user_voted_for_feature: {
        Args: { feature_id: string; user_id: string }
        Returns: boolean
      }
      increment_verification_attempts: {
        Args: { phone_input: string }
        Returns: undefined
      }
      reschedule_visit_booking: {
        Args: {
          booking_id: string
          new_slot_id: string
          new_date: string
          new_time: string
          reason?: string
        }
        Returns: undefined
      }
      update_care_plan_status: {
        Args: { plan_id: string; new_status: string }
        Returns: undefined
      }
      update_site_visit_status: {
        Args: { plan_id: string; new_status: string }
        Returns: undefined
      }
      update_video_availability: {
        Args: { user_id_param: string; available: boolean }
        Returns: undefined
      }
      update_visit_payment_status: {
        Args: {
          user_id_param: string
          payment_status_param: string
          payment_reference_param?: string
        }
        Returns: undefined
      }
      validate_admin_signup_code: {
        Args: { provided_code: string }
        Returns: boolean
      }
      validate_whatsapp_number: {
        Args: { phone_input: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_status_enum:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "locked"
      care_urgency:
        | "immediate"
        | "within_week"
        | "within_month"
        | "planning_ahead"
      chatbot_message_type: "text" | "option" | "handoff" | "form"
      chatbot_sender_type: "user" | "bot" | "human_agent"
      chatbot_status: "active" | "completed" | "abandoned"
      content_type: "text" | "image" | "video"
      coverage_claim_status:
        | "pending_family_confirmation"
        | "confirmed"
        | "declined"
      coverage_request_status:
        | "pending_family_approval"
        | "approved"
        | "denied"
        | "expired"
      delivery_status: "sent" | "delivered" | "failed" | "pending"
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
      shift_notification_type:
        | "reminder_2_days"
        | "reminder_night_before"
        | "coverage_available"
        | "assignment_confirmed"
        | "time_off_request"
        | "coverage_claimed"
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
      admin_status_enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "locked",
      ],
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
      coverage_claim_status: [
        "pending_family_confirmation",
        "confirmed",
        "declined",
      ],
      coverage_request_status: [
        "pending_family_approval",
        "approved",
        "denied",
        "expired",
      ],
      delivery_status: ["sent", "delivered", "failed", "pending"],
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
      shift_notification_type: [
        "reminder_2_days",
        "reminder_night_before",
        "coverage_available",
        "assignment_confirmed",
        "time_off_request",
        "coverage_claimed",
      ],
      user_role: ["family", "professional", "community", "admin"],
    },
  },
} as const
