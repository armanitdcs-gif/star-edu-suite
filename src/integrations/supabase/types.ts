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
      admission_applications: {
        Row: {
          academic_year: string
          address: string
          admin_notes: string | null
          application_no: string
          applying_for_grade: string
          birth_certificate_no: string | null
          created_at: string
          date_of_birth: string
          gender: Database["public"]["Enums"]["admission_gender"]
          guardian_email: string | null
          guardian_name: string
          guardian_phone: string
          guardian_relation: string
          id: string
          medical_notes: string | null
          nationality: string
          passport_no: string | null
          previous_school: string | null
          qid_no: string | null
          religion: string | null
          status: Database["public"]["Enums"]["admission_status"]
          student_first_name: string
          student_id: string | null
          student_last_name: string
          updated_at: string
        }
        Insert: {
          academic_year?: string
          address: string
          admin_notes?: string | null
          application_no?: string
          applying_for_grade: string
          birth_certificate_no?: string | null
          created_at?: string
          date_of_birth: string
          gender: Database["public"]["Enums"]["admission_gender"]
          guardian_email?: string | null
          guardian_name: string
          guardian_phone: string
          guardian_relation?: string
          id?: string
          medical_notes?: string | null
          nationality: string
          passport_no?: string | null
          previous_school?: string | null
          qid_no?: string | null
          religion?: string | null
          status?: Database["public"]["Enums"]["admission_status"]
          student_first_name: string
          student_id?: string | null
          student_last_name: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          address?: string
          admin_notes?: string | null
          application_no?: string
          applying_for_grade?: string
          birth_certificate_no?: string | null
          created_at?: string
          date_of_birth?: string
          gender?: Database["public"]["Enums"]["admission_gender"]
          guardian_email?: string | null
          guardian_name?: string
          guardian_phone?: string
          guardian_relation?: string
          id?: string
          medical_notes?: string | null
          nationality?: string
          passport_no?: string | null
          previous_school?: string | null
          qid_no?: string | null
          religion?: string | null
          status?: Database["public"]["Enums"]["admission_status"]
          student_first_name?: string
          student_id?: string | null
          student_last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          affected_count: number
          created_at: string
          details: Json
          id: string
          module: string
          record_ids: string[]
          record_refs: string[]
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          affected_count?: number
          created_at?: string
          details?: Json
          id?: string
          module: string
          record_ids?: string[]
          record_refs?: string[]
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          affected_count?: number
          created_at?: string
          details?: Json
          id?: string
          module?: string
          record_ids?: string[]
          record_refs?: string[]
        }
        Relationships: []
      }
      class_sections: {
        Row: {
          academic_year: string
          capacity: number
          created_at: string
          grade: string
          id: string
          section: string
          updated_at: string
        }
        Insert: {
          academic_year?: string
          capacity?: number
          created_at?: string
          grade: string
          id?: string
          section: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          capacity?: number
          created_at?: string
          grade?: string
          id?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          academic_year: string
          class_section_id: string
          created_at: string
          enrolled_at: string
          id: string
          roll_no: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          class_section_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          roll_no?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class_section_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          roll_no?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_section_id_fkey"
            columns: ["class_section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          applicant_name: string
          applicant_ref: string | null
          applicant_type: Database["public"]["Enums"]["leave_applicant_type"]
          approver_notes: string | null
          contact_email: string | null
          contact_phone: string
          created_at: string
          decided_at: string | null
          decided_by_email: string | null
          department: string | null
          end_date: string
          id: string
          leave_type: Database["public"]["Enums"]["leave_type"]
          reason: string
          request_no: string
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          substitute_name: string | null
          total_days: number
          updated_at: string
        }
        Insert: {
          applicant_name: string
          applicant_ref?: string | null
          applicant_type?: Database["public"]["Enums"]["leave_applicant_type"]
          approver_notes?: string | null
          contact_email?: string | null
          contact_phone: string
          created_at?: string
          decided_at?: string | null
          decided_by_email?: string | null
          department?: string | null
          end_date: string
          id?: string
          leave_type?: Database["public"]["Enums"]["leave_type"]
          reason: string
          request_no?: string
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          substitute_name?: string | null
          total_days?: number
          updated_at?: string
        }
        Update: {
          applicant_name?: string
          applicant_ref?: string | null
          applicant_type?: Database["public"]["Enums"]["leave_applicant_type"]
          approver_notes?: string | null
          contact_email?: string | null
          contact_phone?: string
          created_at?: string
          decided_at?: string | null
          decided_by_email?: string | null
          department?: string | null
          end_date?: string
          id?: string
          leave_type?: Database["public"]["Enums"]["leave_type"]
          reason?: string
          request_no?: string
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          substitute_name?: string | null
          total_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string
          admission_application_id: string | null
          birth_certificate_no: string | null
          created_at: string
          date_of_birth: string
          first_name: string
          gender: Database["public"]["Enums"]["admission_gender"]
          guardian_email: string | null
          guardian_name: string
          guardian_phone: string
          guardian_relation: string
          id: string
          last_name: string
          medical_notes: string | null
          nationality: string
          passport_no: string | null
          photo_url: string | null
          qid_no: string | null
          religion: string | null
          status: Database["public"]["Enums"]["student_status"]
          student_no: string
          updated_at: string
        }
        Insert: {
          address: string
          admission_application_id?: string | null
          birth_certificate_no?: string | null
          created_at?: string
          date_of_birth: string
          first_name: string
          gender: Database["public"]["Enums"]["admission_gender"]
          guardian_email?: string | null
          guardian_name: string
          guardian_phone: string
          guardian_relation?: string
          id?: string
          last_name: string
          medical_notes?: string | null
          nationality: string
          passport_no?: string | null
          photo_url?: string | null
          qid_no?: string | null
          religion?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_no: string
          updated_at?: string
        }
        Update: {
          address?: string
          admission_application_id?: string | null
          birth_certificate_no?: string | null
          created_at?: string
          date_of_birth?: string
          first_name?: string
          gender?: Database["public"]["Enums"]["admission_gender"]
          guardian_email?: string | null
          guardian_name?: string
          guardian_phone?: string
          guardian_relation?: string
          id?: string
          last_name?: string
          medical_notes?: string | null
          nationality?: string
          passport_no?: string | null
          photo_url?: string | null
          qid_no?: string | null
          religion?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_no?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_admission_application_id_fkey"
            columns: ["admission_application_id"]
            isOneToOne: false
            referencedRelation: "admission_applications"
            referencedColumns: ["id"]
          },
        ]
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      admission_gender: "male" | "female" | "other"
      admission_status: "pending" | "interview" | "approved" | "rejected"
      app_role: "admin" | "staff"
      enrollment_status: "active" | "transferred" | "left" | "completed"
      leave_applicant_type: "staff" | "student"
      leave_status: "pending" | "review" | "approved" | "rejected"
      leave_type:
        | "casual"
        | "sick"
        | "annual"
        | "emergency"
        | "unpaid"
        | "maternity"
      student_status:
        | "active"
        | "inactive"
        | "graduated"
        | "transferred"
        | "left"
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
      admission_gender: ["male", "female", "other"],
      admission_status: ["pending", "interview", "approved", "rejected"],
      app_role: ["admin", "staff"],
      enrollment_status: ["active", "transferred", "left", "completed"],
      leave_applicant_type: ["staff", "student"],
      leave_status: ["pending", "review", "approved", "rejected"],
      leave_type: [
        "casual",
        "sick",
        "annual",
        "emergency",
        "unpaid",
        "maternity",
      ],
      student_status: [
        "active",
        "inactive",
        "graduated",
        "transferred",
        "left",
      ],
    },
  },
} as const
