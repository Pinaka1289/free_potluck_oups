export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      potluckpartys_events: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          event_date: string | null
          event_time: string | null
          location: string | null
          host_name: string | null
          host_email: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          location?: string | null
          host_name?: string | null
          host_email?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          location?: string | null
          host_name?: string | null
          host_email?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      potluckpartys_items: {
        Row: {
          id: string
          event_id: string
          name: string
          category: string
          quantity: number
          brought_by: string | null
          notes: string | null
          claimed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          category?: string
          quantity?: number
          brought_by?: string | null
          notes?: string | null
          claimed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          category?: string
          quantity?: number
          brought_by?: string | null
          notes?: string | null
          claimed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      potluckpartys_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Event = Database['public']['Tables']['potluckpartys_events']['Row']
export type EventInsert = Database['public']['Tables']['potluckpartys_events']['Insert']
export type EventUpdate = Database['public']['Tables']['potluckpartys_events']['Update']

export type Item = Database['public']['Tables']['potluckpartys_items']['Row']
export type ItemInsert = Database['public']['Tables']['potluckpartys_items']['Insert']
export type ItemUpdate = Database['public']['Tables']['potluckpartys_items']['Update']

export type Profile = Database['public']['Tables']['potluckpartys_profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['potluckpartys_profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['potluckpartys_profiles']['Update']
