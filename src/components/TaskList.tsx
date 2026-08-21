// TaskList — renders tasks with category chip, place, completion toggle, and delete.
// Done tasks appear at the bottom with a remove button.

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
  onToggleDone?: (id: string) => void
  onDelete?: (id: string) => void
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
  onToggleDone,
  onDelete,
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
        {tasks.map((task) => {
          const isDone = task.status === 'done'
          return (
            <li key={task.id} className="flex items-start gap-3 py-5 first:pt-0">
              {/* Completion checkbox */}
              <button
                type="button"
                aria-label={
                  isDone
                    ? `Mark "${task.title}" as pending`
                    : `Mark "${task.title}" as done`
                }
                onClick={() => onToggleDone?.(task.id)}
                className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                  isDone
                    ? 'border-accent bg-accent text-white'
                    : 'border-stone-300 bg-white hover:border-accent'
                }`}
              >
                {isDone && (
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    className="size-3"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={`text-lg font-medium leading-snug transition-colors ${
                      isDone ? 'text-stone-400 line-through' : 'text-stone-900'
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <Chip
                      label={task.category}
                      variant={isDone ? 'default' : 'accent'}
                    />
                    {isDone && onDelete && (
                      <button
                        type="button"
                        aria-label={`Remove "${task.title}"`}
                        onClick={() => onDelete(task.id)}
                        className="text-stone-300 transition-colors hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-300/50"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          className="size-4"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 4l8 8M12 4l-8 8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p
                  className={`text-sm ${isDone ? 'text-stone-300' : 'text-stone-400'}`}
                >
                  {task.place}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </DataStateView>
  )
}
