
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          completed: boolean;
          due_date: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: string;
          completed?: boolean;
          due_date?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          completed?: boolean;
          due_date?: string | null;
          created_at?: string;
          user_id?: string;
        };
      };
      pomodoro_sessions: {
        Row: {
          id: string;
          name: string;
          work_duration: number;
          break_duration: number;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          work_duration: number;
          break_duration: number;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          work_duration?: number;
          break_duration?: number;
          created_at?: string;
          user_id?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
        };
      };
    };
  };
};

// Use environment variables with fallback to hardcoded values (only for development)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://xuaaemwhuucjgkuwgjmh.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1YWFlbXdodXVjamdrdXdnam1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2Mzg1NjMsImV4cCI6MjA1ODIxNDU2M30.C0g4OZ_Ej5czkOXPMoHvkNCKZiot9EJ81l6sk4Kd8aM";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

export function getClient(): SupabaseClient<Database> {
  return supabase;
}
