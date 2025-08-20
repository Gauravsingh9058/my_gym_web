import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  membership_type: string;
  created_at: string;
  updated_at: string;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  bio?: string;
  image_url?: string;
  rating: number;
  created_at: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  image_url?: string;
  trainer_id?: string;
  max_participants: number;
  created_at: string;
  trainer?: Trainer;
}

export interface Booking {
  id: string;
  user_id: string;
  program_id: string;
  booking_date: string;
  status: string;
  created_at: string;
  program?: Program;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}