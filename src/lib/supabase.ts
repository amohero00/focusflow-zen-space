
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables = {
  tasks: {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    category: string;
    completed: boolean;
    due_date: string | null;
    created_at: string;
  };
  pomodoro_sessions: {
    id: string;
    user_id: string;
    name: string;
    work_duration: number;
    break_duration: number;
    created_at: string;
  };
}
