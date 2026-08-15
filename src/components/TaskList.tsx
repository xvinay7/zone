// TaskList — renders a list of tasks with title, category chip, and place name.

import type { DataStatus, Task } from '../types'
import Chip from './ui/Chip'
import DataStateView from './ui/DataStateView'
import Skeleton from './ui/Skeleton'

export interface TaskListProps {
  tasks: Task[]
  status: DataStatus
  errorMessage?: string
  emptyMessage?: string
  loadingLabel?: string
}

function TaskListSkeleton() {
  return (
    <ul className="divide-y divide-stone-100" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="flex flex-col gap-2 py-5 first:pt-0">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-1/3" />
        </li>
      ))}
    </ul>
  )
}

export default function TaskList({
  tasks,
  status,
  errorMessage = 'We couldn\u2019t load your tasks. Pull to refresh and try again.',
  emptyMessage = 'No tasks yet. Add one above.',
  loadingLabel = 'Loading tasks',
}: TaskListProps) {
  return (
    <DataStateView
      status={status}
      errorMessage={errorMessage}
      emptyMessage={emptyMessage}
      loadingLabel={loadingLabel}
      isEmpty={tasks.length === 0}
      loadingFallback={<TaskListSkeleton />}
    >
      <ul className="divide-y divide-stone-100">
        {tasks.map((task) => (
          <li key={task.id} className="flex flex-col gap-2 py-5 first:pt-0">
            <div className="flex items-start justify-between gap-3">
              <p className="text-lg font-medium leading-snug text-stone-900">
                {task.title}
              </p>
              <Chip label={task.category} />
            </div>
            <p className="text-sm text-stone-400">{task.place}</p>
          </li>
        ))}
      </ul>
    </DataStateView>
  )
}
