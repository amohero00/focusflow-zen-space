
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

// Create a single supabase client for interacting with your database
// Use environment variables with fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.MEIYYcPbA-0GiZSTrXvwefnmEGKvDPpP_iRBEKqi7jg';

// Log a warning but don't prevent app from loading
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials are using fallback values. For production, please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function getClient(): SupabaseClient<Database> {
  return supabase;
}
