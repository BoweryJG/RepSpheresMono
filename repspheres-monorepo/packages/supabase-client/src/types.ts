import { SupabaseClient as OriginalSupabaseClient, Provider as OriginalProvider, Session, User } from '@supabase/supabase-js';

// Re-export Provider type
export type Provider = OriginalProvider;

// User attributes for update operations
export interface UserAttributes {
  email?: string;
  password?: string;
  email_confirm?: boolean;
  phone?: string;
  data?: Record<string, any>;
}

// Define the database schema types
export type Tables = {
  aesthetic_procedures: {
    Row: {
      id: number;
      name: string;
      description: string;
      category_id: number;
      average_cost: number;
      recovery_time: string;
      popularity_score: number;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: number;
      name: string;
      description: string;
      category_id: number;
      average_cost?: number;
      recovery_time?: string;
      popularity_score?: number;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: number;
      name?: string;
      description?: string;
      category_id?: number;
      average_cost?: number;
      recovery_time?: string;
      popularity_score?: number;
      created_at?: string;
      updated_at?: string;
    };
  };
  aesthetic_categories: {
    Row: {
      id: number;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: number;
      name: string;
      description: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: number;
      name?: string;
      description?: string;
      created_at?: string;
      updated_at?: string;
    };
  };
  dental_procedures: {
    Row: {
      id: number;
      name: string;
      description: string;
      category_id: number;
      average_cost: number;
      recovery_time: string;
      popularity_score: number;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: number;
      name: string;
      description: string;
      category_id: number;
      average_cost?: number;
      recovery_time?: string;
      popularity_score?: number;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: number;
      name?: string;
      description?: string;
      category_id?: number;
      average_cost?: number;
      recovery_time?: string;
      popularity_score?: number;
      created_at?: string;
      updated_at?: string;
    };
  };
  dental_categories: {
    Row: {
      id: number;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: number;
      name: string;
      description: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: number;
      name?: string;
      description?: string;
      created_at?: string;
      updated_at?: string;
    };
  };
  companies: {
    Row: {
      id: number;
      name: string;
      description: string;
      website: string;
      logo_url: string;
      industry: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: number;
      name: string;
      description: string;
      website?: string;
      logo_url?: string;
      industry: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: number;
      name?: string;
      description?: string;
      website?: string;
      logo_url?: string;
      industry?: string;
      created_at?: string;
      updated_at?: string;
    };
  };
  market_growth: {
    Row: {
      id: number;
      procedure_id: number;
      procedure_type: string;
      year: number;
      growth_rate: number;
      market_size: number;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: number;
      procedure_id: number;
      procedure_type: string;
      year: number;
      growth_rate: number;
      market_size: number;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: number;
      procedure_id?: number;
      procedure_type?: string;
      year?: number;
      growth_rate?: number;
      market_size?: number;
      created_at?: string;
      updated_at?: string;
    };
  };
  news_articles: {
    Row: {
      id: number;
      title: string;
      content: string;
      source: string;
      published_date: string;
      url: string;
      image_url: string;
      category: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: number;
      title: string;
      content: string;
      source: string;
      published_date: string;
      url: string;
      image_url?: string;
      category: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: number;
      title?: string;
      content?: string;
      source?: string;
      published_date?: string;
      url?: string;
      image_url?: string;
      category?: string;
      created_at?: string;
      updated_at?: string;
    };
  };
};

export type Database = {
  public: {
    Tables: Tables;
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: unknown;
    };
  };
};

// Export the typed Supabase client
export type SupabaseClient = OriginalSupabaseClient<Database>;

// Options for creating a Supabase client
export interface SupabaseOptions {
  autoRefreshToken?: boolean;
  persistSession?: boolean;
  detectSessionInUrl?: boolean;
  headers?: Record<string, string>;
}

// Error type for Supabase client
export interface SupabaseError {
  message: string;
  status?: number;
  code?: string;
}

// Auth response type
export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: SupabaseError | null;
}
