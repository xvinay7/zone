export type TaskCategory = 'grocery' | 'pharmacy' | 'errand' | 'other'

export type TaskStatus = 'pending' | 'done'

export interface Task {
  id: string
  title: string
  category: TaskCategory
  place: string
  lat?: number
  lng?: number
  status?: TaskStatus
  zoneId?: string
}

export interface Zone {
  id: string
  name: string
  lat: number
  lng: number
  radius: number
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
