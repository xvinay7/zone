// WhileImHereCard — contextual card for nearby tasks with an expandable "Why now?" section
// and inline task completion.

import { useState } from 'react'
import type { DataStatus, NearbyStore, Task } from '../types'
import Button from './ui/Button'
import Card from './ui/Card'
import DataStateView from './ui/DataStateView'
import Skeleton from './ui/Skeleton'

export interface WhileImHereCardProps {
  store: NearbyStore
  tasks: Task[]
  status: DataStatus
  errorMessage?: string
  emptyMessage?: string
  loadingLabel?: string
  onToggleDone?: (id: string) => void
}

function WhileImHereCardSkeleton() {
  return (
    <Card variant="accent" aria-hidden="true">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-7 w-40" />
      <Skeleton className="mt-2 h-5 w-48" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  )
}

export default function WhileImHereCard({
  store,
  tasks,
  status,
  errorMessage = 'We couldn\u2019t load nearby suggestions right now.',
  emptyMessage = 'No nearby tasks to suggest at the moment.',
  loadingLabel = 'Checking what\u2019s nearby',
  onToggleDone,
}: WhileImHereCardProps) {
  const [expanded, setExpanded] = useState(false)

  const pendingTasks = tasks.filter((t) => t.status !== 'done')
  const doneTasks = tasks.filter((t) => t.status === 'done')

  return (
    <DataStateView
      status={status}
      errorMessage={errorMessage}
      emptyMessage={emptyMessage}
      loadingLabel={loadingLabel}
      isEmpty={tasks.length === 0}
      loadingFallback={<WhileImHereCardSkeleton />}
    >
      <Card variant="accent">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          While you&apos;re here
        </p>

        <h2 className="mt-2 text-xl font-semibold text-stone-900">{store.name}</h2>

        <p className="mt-1 text-base text-stone-600">
          {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} to do
          {doneTasks.length > 0 && (
            <span className="text-stone-400">
              {' '}
              · {doneTasks.length} done
            </span>
          )}
          <span className="text-stone-400"> · </span>+{store.extraMinutes} min
        </p>

        <ul className="mt-4 space-y-2">
          {tasks.map((task) => {
            const isDone = task.status === 'done'
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onToggleDone?.(task.id)}
                  aria-label={
                    isDone
                      ? `Mark "${task.title}" as pending`
                      : `Mark "${task.title}" as done`
                  }
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    isDone
                      ? 'bg-white/40 text-stone-400'
                      : 'bg-white/70 text-stone-700 hover:bg-white/90'
                  }`}
                >
                  {/* Mini checkbox */}
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isDone
                        ? 'border-accent bg-accent text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                    aria-hidden="true"
                  >
                    {isDone && (
                      <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className={isDone ? 'line-through' : ''}>{task.title}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <Button
          variant="ghost"
          fullWidth
          onClick={() => setExpanded((previous) => !previous)}
          className="mt-4 justify-between px-0 py-0 text-sm hover:bg-transparent"
          aria-expanded={expanded}
        >
          Why now?
          <span className="text-lg leading-none">{expanded ? '−' : '+'}</span>
        </Button>

        {expanded && (
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{store.whyNow}</p>
        )}
      </Card>
    </DataStateView>
  )
}
