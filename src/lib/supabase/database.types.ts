export type TaskCategory = 'grocery' | 'pharmacy' | 'errand' | 'other'
export type TaskStatus = 'pending' | 'done'
export type SuggestionAction = 'dismissed' | 'acted' | 'expired'

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          category: TaskCategory
          place_name: string
          lat: number | null
          lng: number | null
          status: TaskStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category?: TaskCategory
          place_name?: string
          lat?: number | null
          lng?: number | null
          status?: TaskStatus
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: TaskCategory
          place_name?: string
          lat?: number | null
          lng?: number | null
          status?: TaskStatus
          created_at?: string
        }
        Relationships: []
      }
      suggestions_log: {
        Row: {
          id: string
          user_id: string
          task_ids: string[]
          score: number
          why_now_text: string
          shown_at: string
          action: SuggestionAction | null
        }
        Insert: {
          id?: string
          user_id: string
          task_ids?: string[]
          score: number
          why_now_text: string
          shown_at?: string
          action?: SuggestionAction | null
        }
        Update: {
          id?: string
          user_id?: string
          task_ids?: string[]
          score?: number
          why_now_text?: string
          shown_at?: string
          action?: SuggestionAction | null
        }
        Relationships: []
      }
      notification_budget: {
        Row: {
          user_id: string
          suggestions_today: number
          last_suggestion_at: string | null
          muted_places: string[]
        }
        Insert: {
          user_id: string
          suggestions_today?: number
          last_suggestion_at?: string | null
          muted_places?: string[]
        }
        Update: {
          user_id?: string
          suggestions_today?: number
          last_suggestion_at?: string | null
          muted_places?: string[]
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      task_category: TaskCategory
      task_status: TaskStatus
      suggestion_action: SuggestionAction
    }
    CompositeTypes: Record<string, never>
  }
}

export type TaskRow = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export class DataError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'DataError'
  }
}
