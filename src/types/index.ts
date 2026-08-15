export type TaskCategory = 'grocery' | 'pharmacy' | 'errand' | 'other'

export interface Task {
  id: string
  title: string
  category: TaskCategory
  place: string
}

export interface NearbyStore {
  name: string
  taskCount: number
  extraMinutes: number
  whyNow: string
}

export interface AppSettings {
  maxSuggestionsPerDay: number
}

/** Visual state for components that receive data through props. */
export type DataStatus = 'loading' | 'error' | 'empty' | 'ready'
