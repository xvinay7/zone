// WhileImHereCard — contextual card for nearby tasks with an expandable "Why now?" section.

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
}: WhileImHereCardProps) {
  const [expanded, setExpanded] = useState(false)

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
          {store.taskCount} tasks nearby
          <span className="text-stone-400"> · </span>+{store.extraMinutes} min
        </p>

        <ul className="mt-4 space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-lg bg-white/70 px-3 py-2 text-sm text-stone-700"
            >
              {task.title}
            </li>
          ))}
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
