import type { Task } from '../types'

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Buy oat milk',
    category: 'grocery',
    place: 'Whole Foods',
  },
  {
    id: '2',
    title: 'Pick up prescription',
    category: 'pharmacy',
    place: 'CVS on Main St',
  },
  {
    id: '3',
    title: 'Drop off dry cleaning',
    category: 'errand',
    place: 'City Cleaners',
  },
  {
    id: '4',
    title: 'Call dentist to reschedule',
    category: 'other',
    place: 'Home',
  },
]

export const NEARBY_STORE = {
  name: "Trader Joe's",
  taskCount: 3,
  extraMinutes: 12,
  whyNow:
    "You're within 0.3 mi and these items pair well with your grocery run today.",
}

export const NEARBY_TASKS: Task[] = [
  {
    id: 'n1',
    title: 'Get bananas',
    category: 'grocery',
    place: "Trader Joe's",
  },
  {
    id: 'n2',
    title: 'Grab frozen meals',
    category: 'grocery',
    place: "Trader Joe's",
  },
  {
    id: 'n3',
    title: 'Buy flowers',
    category: 'errand',
    place: "Trader Joe's",
  },
]

export const DEFAULT_SETTINGS = {
  maxSuggestionsPerDay: 3,
}
