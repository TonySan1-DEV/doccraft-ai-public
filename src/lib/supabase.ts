import { createClient } from '@supabase/supabase-js';
import env from '../config/env';

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Log warning if using placeholder values
if (
  supabaseUrl === 'https://placeholder.supabase.co' ||
  supabaseAnonKey === 'placeholder-key'
) {
  console.warn(
    '⚠️ Using placeholder Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file'
  );
  console.warn('⚠️ The app will run in demo mode with limited functionality');
}

// Create Supabase client with error handling
let supabase: any;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  console.log('✅ Supabase client created successfully');
} catch (error) {
  console.error('❌ Error creating Supabase client:', error);

  // Create a mock client for development
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signIn: async () => ({
        error: { message: 'Demo mode - authentication disabled' },
      }),
      signUp: async () => ({
        error: { message: 'Demo mode - authentication disabled' },
      }),
      signOut: async () => ({ error: null }),
    },
  };
  console.log('🔄 Using mock Supabase client for demo mode');
}

export { supabase };

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          title: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_sections: {
        Row: {
          id: string;
          document_id: string;
          content: string;
          topic_tags: string[];
          tone: string;
          intent: string;
          section_vector: number[];
          section_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          content: string;
          topic_tags: string[];
          tone: string;
          intent: string;
          section_vector: number[];
          section_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          content?: string;
          topic_tags?: string[];
          tone?: string;
          intent?: string;
          section_vector?: number[];
          section_order?: number;
          created_at?: string;
        };
      };
      images: {
        Row: {
          id: string;
          section_id: string;
          source: 'ai' | 'stock' | 'upload';
          source_metadata: any;
          caption: string;
          relevance_score: number;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          source: 'ai' | 'stock' | 'upload';
          source_metadata: any;
          caption: string;
          relevance_score: number;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          source?: 'ai' | 'stock' | 'upload';
          source_metadata?: any;
          caption?: string;
          relevance_score?: number;
          image_url?: string;
          created_at?: string;
        };
      };
      image_feedback: {
        Row: {
          id: string;
          image_id: string;
          section_id: string;
          feedback_type: 'like' | 'dislike' | 'skip';
          timestamp: string;
        };
        Insert: {
          id?: string;
          image_id: string;
          section_id: string;
          feedback_type: 'like' | 'dislike' | 'skip';
          timestamp?: string;
        };
        Update: {
          id?: string;
          image_id?: string;
          section_id?: string;
          feedback_type?: 'like' | 'dislike' | 'skip';
          timestamp?: string;
        };
      };
      // Support System Tables
      support_tickets: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          priority: string;
          status: string;
          user_id: string;
          assigned_to?: string;
          created_at: string;
          updated_at: string;
          resolved_at?: string;
          tags: string[];
          satisfaction_rating?: number;
          internal_notes?: string;
          estimated_resolution_time?: string;
          actual_resolution_time?: string;
          escalation_level: number;
          last_activity_at: string;
          is_urgent: boolean;
          customer_impact: string;
          business_impact: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          priority: string;
          status?: string;
          user_id: string;
          assigned_to?: string;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string;
          tags?: string[];
          satisfaction_rating?: number;
          internal_notes?: string;
          estimated_resolution_time?: string;
          actual_resolution_time?: string;
          escalation_level?: number;
          last_activity_at?: string;
          is_urgent?: boolean;
          customer_impact?: string;
          business_impact?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          priority?: string;
          status?: string;
          user_id?: string;
          assigned_to?: string;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string;
          tags?: string[];
          satisfaction_rating?: number;
          internal_notes?: string;
          estimated_resolution_time?: string;
          actual_resolution_time?: string;
          escalation_level?: number;
          last_activity_at?: string;
          is_urgent?: boolean;
          customer_impact?: string;
          business_impact?: string;
        };
      };
      ticket_messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_id: string;
          sender_type: string;
          content: string;
          content_type: string;
          created_at: string;
          is_internal: boolean;
          read_by: string[];
          edited_at?: string;
          reply_to?: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          sender_id: string;
          sender_type: string;
          content: string;
          content_type?: string;
          created_at?: string;
          is_internal?: boolean;
          read_by?: string[];
          edited_at?: string;
          reply_to?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          sender_id?: string;
          sender_type?: string;
          content?: string;
          content_type?: string;
          created_at?: string;
          is_internal?: boolean;
          read_by?: string[];
          edited_at?: string;
          reply_to?: string;
        };
      };
      support_agents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          avatar?: string;
          department: string;
          skills: string[];
          availability: string;
          current_tickets: number;
          max_tickets: number;
          average_resolution_time: number;
          satisfaction_score: number;
          is_available: boolean;
          last_active_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          avatar?: string;
          department: string;
          skills?: string[];
          availability?: string;
          current_tickets?: number;
          max_tickets?: number;
          average_resolution_time?: number;
          satisfaction_score?: number;
          is_available?: boolean;
          last_active_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          avatar?: string;
          department?: string;
          skills?: string[];
          availability?: string;
          current_tickets?: number;
          max_tickets?: number;
          average_resolution_time?: number;
          satisfaction_score?: number;
          is_available?: boolean;
          last_active_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          agent_id?: string;
          status: string;
          started_at: string;
          ended_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id?: string;
          status?: string;
          started_at?: string;
          ended_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_id?: string;
          status?: string;
          started_at?: string;
          ended_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          sender_id: string;
          sender_type: string;
          content: string;
          message_type: string;
          timestamp: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          sender_id: string;
          sender_type: string;
          content: string;
          message_type: string;
          timestamp?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          sender_id?: string;
          sender_type?: string;
          content?: string;
          message_type?: string;
          timestamp?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      faq_items: {
        Row: {
          id: string;
          question: string;
          answer: string;
          category: string;
          tags: string[];
          views: number;
          helpful: number;
          not_helpful: number;
          last_updated: string;
          is_published: boolean;
          related_tickets: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          category: string;
          tags?: string[];
          views?: number;
          helpful?: number;
          not_helpful?: number;
          last_updated?: string;
          is_published?: boolean;
          related_tickets?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          category?: string;
          tags?: string[];
          views?: number;
          helpful?: number;
          not_helpful?: number;
          last_updated?: string;
          is_published?: boolean;
          related_tickets?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
