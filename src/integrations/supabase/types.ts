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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          description: string | null
          due_at: string | null
          external_reference: string | null
          id: string
          occurred_at: string | null
          opportunity_id: string | null
          outcome: string | null
          owner_id: string | null
          source_system: string | null
          subject: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          external_reference?: string | null
          id?: string
          occurred_at?: string | null
          opportunity_id?: string | null
          outcome?: string | null
          owner_id?: string | null
          source_system?: string | null
          subject: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          external_reference?: string | null
          id?: string
          occurred_at?: string | null
          opportunity_id?: string | null
          outcome?: string | null
          owner_id?: string | null
          source_system?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          account_tier: string | null
          account_value: number | null
          annual_revenue_estimate: number | null
          city: string | null
          country: string | null
          created_at: string | null
          health_score: number | null
          id: string
          industry: string | null
          is_stale: boolean | null
          last_activity_at: string | null
          lead_source_id: string | null
          name: string
          next_follow_up_at: string | null
          notes: string | null
          owner_id: string | null
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          account_tier?: string | null
          account_value?: number | null
          annual_revenue_estimate?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          health_score?: number | null
          id?: string
          industry?: string | null
          is_stale?: boolean | null
          last_activity_at?: string | null
          lead_source_id?: string | null
          name: string
          next_follow_up_at?: string | null
          notes?: string | null
          owner_id?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          account_tier?: string | null
          account_value?: number | null
          annual_revenue_estimate?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          health_score?: number | null
          id?: string
          industry?: string | null
          is_stale?: boolean | null
          last_activity_at?: string | null
          lead_source_id?: string | null
          name?: string
          next_follow_up_at?: string | null
          notes?: string | null
          owner_id?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_lead_source_id_fkey"
            columns: ["lead_source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      company_tags: {
        Row: {
          company_id: string
          tag_id: string
        }
        Insert: {
          company_id: string
          tag_id: string
        }
        Update: {
          company_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          contact_id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          is_primary: boolean | null
          last_name: string
          linkedin_url: string | null
          owner_id: string | null
          phone: string | null
          role_in_decision: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_primary?: boolean | null
          last_name: string
          linkedin_url?: string | null
          owner_id?: string | null
          phone?: string | null
          role_in_decision?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_primary?: boolean | null
          last_name?: string
          linkedin_url?: string | null
          owner_id?: string | null
          phone?: string | null
          role_in_decision?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_analyses: {
        Row: {
          analysis_version: number | null
          business_challenges: string | null
          coaching_feedback: string | null
          company_id: string | null
          created_at: string | null
          follow_up_email_draft: string | null
          id: string
          missing_elements: string | null
          model_name: string | null
          objections: string | null
          opportunity_id: string | null
          opportunity_strength: string | null
          pains: string | null
          recommended_next_action: string | null
          risk_flags: string | null
          score_budget: number | null
          score_confidence: number | null
          score_impact: number | null
          score_next_step: number | null
          score_notes_quality: number | null
          score_pain: number | null
          score_stakeholder: number | null
          score_total: number | null
          score_urgency: number | null
          suggested_questions: string | null
          summary: string | null
          transcript_id: string | null
          urgency_signals: string | null
        }
        Insert: {
          analysis_version?: number | null
          business_challenges?: string | null
          coaching_feedback?: string | null
          company_id?: string | null
          created_at?: string | null
          follow_up_email_draft?: string | null
          id?: string
          missing_elements?: string | null
          model_name?: string | null
          objections?: string | null
          opportunity_id?: string | null
          opportunity_strength?: string | null
          pains?: string | null
          recommended_next_action?: string | null
          risk_flags?: string | null
          score_budget?: number | null
          score_confidence?: number | null
          score_impact?: number | null
          score_next_step?: number | null
          score_notes_quality?: number | null
          score_pain?: number | null
          score_stakeholder?: number | null
          score_total?: number | null
          score_urgency?: number | null
          suggested_questions?: string | null
          summary?: string | null
          transcript_id?: string | null
          urgency_signals?: string | null
        }
        Update: {
          analysis_version?: number | null
          business_challenges?: string | null
          coaching_feedback?: string | null
          company_id?: string | null
          created_at?: string | null
          follow_up_email_draft?: string | null
          id?: string
          missing_elements?: string | null
          model_name?: string | null
          objections?: string | null
          opportunity_id?: string | null
          opportunity_strength?: string | null
          pains?: string | null
          recommended_next_action?: string | null
          risk_flags?: string | null
          score_budget?: number | null
          score_confidence?: number | null
          score_impact?: number | null
          score_next_step?: number | null
          score_notes_quality?: number | null
          score_pain?: number | null
          score_stakeholder?: number | null
          score_total?: number | null
          score_urgency?: number | null
          suggested_questions?: string | null
          summary?: string | null
          transcript_id?: string | null
          urgency_signals?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discovery_analyses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_analyses_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_analyses_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          category: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          file_name: string
          file_type: string | null
          id: string
          opportunity_id: string | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          file_name: string
          file_type?: string | null
          id?: string
          opportunity_id?: string | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          file_name?: string
          file_type?: string | null
          id?: string
          opportunity_id?: string | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_accounts: {
        Row: {
          created_at: string | null
          external_account_id: string | null
          id: string
          last_sync_at: string | null
          provider: string
          scopes: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          external_account_id?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          scopes?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          external_account_id?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          scopes?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lead_sources: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          blocker_summary: string | null
          closed_at: string | null
          company_id: string | null
          confidence_level: string | null
          created_at: string | null
          discovery_score: number | null
          expected_close_date: string | null
          health: string | null
          id: string
          is_stale: boolean | null
          last_activity_at: string | null
          lost_reason: string | null
          name: string
          next_step: string | null
          next_step_due_at: string | null
          owner_id: string | null
          pain_summary: string | null
          primary_contact_id: string | null
          probability: number | null
          source: string | null
          stage: Database["public"]["Enums"]["opportunity_stage"] | null
          status: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          blocker_summary?: string | null
          closed_at?: string | null
          company_id?: string | null
          confidence_level?: string | null
          created_at?: string | null
          discovery_score?: number | null
          expected_close_date?: string | null
          health?: string | null
          id?: string
          is_stale?: boolean | null
          last_activity_at?: string | null
          lost_reason?: string | null
          name: string
          next_step?: string | null
          next_step_due_at?: string | null
          owner_id?: string | null
          pain_summary?: string | null
          primary_contact_id?: string | null
          probability?: number | null
          source?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"] | null
          status?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          blocker_summary?: string | null
          closed_at?: string | null
          company_id?: string | null
          confidence_level?: string | null
          created_at?: string | null
          discovery_score?: number | null
          expected_close_date?: string | null
          health?: string | null
          id?: string
          is_stale?: boolean | null
          last_activity_at?: string | null
          lost_reason?: string | null
          name?: string
          next_step?: string | null
          next_step_due_at?: string | null
          owner_id?: string | null
          pain_summary?: string | null
          primary_contact_id?: string | null
          probability?: number | null
          source?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"] | null
          status?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_primary_contact_id_fkey"
            columns: ["primary_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_tags: {
        Row: {
          opportunity_id: string
          tag_id: string
        }
        Insert: {
          opportunity_id: string
          tag_id: string
        }
        Update: {
          opportunity_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_tags_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          team: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          team?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          team?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      revenue_entries: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          opportunity_id: string | null
          period_date: string | null
          revenue_type: string | null
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          period_date?: string | null
          revenue_type?: string | null
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          period_date?: string | null
          revenue_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_entries_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          direction: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string | null
          provider: string | null
          run_at: string | null
          status: string | null
        }
        Insert: {
          direction?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          provider?: string | null
          run_at?: string | null
          status?: string | null
        }
        Update: {
          direction?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          provider?: string | null
          run_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          auto_created: boolean | null
          company_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          created_by_workflow: string | null
          description: string | null
          due_at: string | null
          id: string
          opportunity_id: string | null
          owner_id: string | null
          priority: string | null
          status: string | null
          title: string
        }
        Insert: {
          auto_created?: boolean | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by_workflow?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          opportunity_id?: string | null
          owner_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
        }
        Update: {
          auto_created?: boolean | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by_workflow?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          opportunity_id?: string | null
          owner_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          generated_by: string | null
          id: string
          language: string | null
          opportunity_id: string | null
          source_file_id: string | null
          source_type: string | null
          transcript_status: string | null
          transcript_text: string | null
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          generated_by?: string | null
          id?: string
          language?: string | null
          opportunity_id?: string | null
          source_file_id?: string | null
          source_type?: string | null
          transcript_status?: string | null
          transcript_text?: string | null
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          generated_by?: string | null
          id?: string
          language?: string | null
          opportunity_id?: string | null
          source_file_id?: string | null
          source_type?: string | null
          transcript_status?: string | null
          transcript_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "files"
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
      activity_type: "call" | "email" | "meeting" | "note" | "task"
      app_role: "admin" | "manager" | "salesperson"
      opportunity_stage:
        | "lead"
        | "discovery"
        | "proposal"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
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
      activity_type: ["call", "email", "meeting", "note", "task"],
      app_role: ["admin", "manager", "salesperson"],
      opportunity_stage: [
        "lead",
        "discovery",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ],
    },
  },
} as const
