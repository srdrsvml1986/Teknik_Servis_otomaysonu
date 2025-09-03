import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
});

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string;
          email: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          phone: string;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_records: {
        Row: {
          id: string;
          tracking_number: string;
          customer_id: string;
          created_by: string;
          product_name: string;
          product_serial: string;
          service_center: string;
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tracking_number?: string;
          customer_id: string;
          created_by: string;
          product_name: string;
          product_serial: string;
          service_center: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tracking_number?: string;
          customer_id?: string;
          created_by?: string;
          product_name?: string;
          product_serial?: string;
          service_center?: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_updates: {
        Row: {
          id: string;
          service_id: string;
          action: string;
          performed_by: string;
          performed_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          action: string;
          performed_by: string;
          performed_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          action?: string;
          performed_by?: string;
          performed_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          operation: 'INSERT' | 'UPDATE' | 'DELETE';
          performed_by: string | null;
          performed_at: string;
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          operation: 'INSERT' | 'UPDATE' | 'DELETE';
          performed_by?: string | null;
          performed_at?: string;
          old_data?: Record<string, unknown> | null;
          new_data?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          operation?: 'INSERT' | 'UPDATE' | 'DELETE';
          performed_by?: string | null;
          performed_at?: string;
          old_data?: Record<string, unknown> | null;
          new_data?: Record<string, unknown> | null;
        };
      };
    };
  };
};