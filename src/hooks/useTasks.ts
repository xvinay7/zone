// useTasks — Supabase-backed task state.
// Drop-in replacement for the previous useLocalStorage<Task[]> usage in App.tsx.
// Exposes the same Task[] shape the rest of the app already understands.

import { useCallback, useEffect, useRef, useState } from 'react'
import { addTask, deleteTask, getTasks, updateTaskStatus } from '../lib/data/tasks'
import { isSupabaseConfigured } from '../lib/supabase/client'
import type { TaskRow } from '../lib/supabase/database.types'
import type { DataStatus, Task, TaskCategory, TaskStatus } from '../types'

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    place: row.place_name,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    status: row.status,
    zoneId: row.zone_id ?? undefined,
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseTasksResult {
  tasks: Task[]
  /** DataStatus for the initial load — maps directly to what TaskList expects. */
  status: DataStatus
  add: (
    title: string,
    category: TaskCategory,
    place: { name: string; lat?: number; lng?: number; zoneId?: string } | null,
  ) => Promise<void>
  toggleDone: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export function useTasks(userId: string | null): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([])
  const [status, setStatus] = useState<DataStatus>('loading')

  // Ref so that toggleDone / remove callbacks stay stable without needing
  // tasks as a dependency (avoids re-creating callbacks on every task update).
  const tasksRef = useRef<Task[]>(tasks)
  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  // -------------------------------------------------------------------------
  // Initial load
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('error')
      return
    }

    if (!userId) return

    let cancelled = false
    setStatus('loading')

    async function load() {
      try {
        const rows = await getTasks(userId!)
        if (!cancelled) {
          setTasks(rows.map(rowToTask))
          setStatus(rows.length === 0 ? 'empty' : 'ready')
        }
      } catch (err) {
        console.error('[useTasks] Failed to load tasks:', err)
        if (!cancelled) setStatus('error')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [userId])

  // -------------------------------------------------------------------------
  // Add
  // -------------------------------------------------------------------------

  const add = useCallback(
    async (
      title: string,
      category: TaskCategory,
      place: { name: string; lat?: number; lng?: number; zoneId?: string } | null,
    ) => {
      if (!isSupabaseConfigured || !userId) return
      try {
        const row = await addTask({
          user_id: userId,
          title,
          category,
          place_name: place?.name.trim() || 'Unassigned',
          lat: place?.lat ?? null,
          lng: place?.lng ?? null,
          zone_id: place?.zoneId ?? null,
        })
        // Prepend so it appears at the top of the list immediately.
        setTasks((prev) => [rowToTask(row), ...prev])
        setStatus('ready')
      } catch (err) {
        console.error('[useTasks] Failed to add task:', err)
      }
    },
    [userId],
  )

  // -------------------------------------------------------------------------
  // Toggle done (optimistic)
  // -------------------------------------------------------------------------

  const toggleDone = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) return
    const task = tasksRef.current.find((t) => t.id === id)
    if (!task) return

    const currentStatus: TaskStatus = task.status ?? 'pending'
    const nextStatus: TaskStatus = currentStatus === 'done' ? 'pending' : 'done'

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)),
    )

    try {
      await updateTaskStatus(id, nextStatus)
    } catch (err) {
      console.error('[useTasks] Failed to update task status:', err)
      // Roll back to original status
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: currentStatus } : t)),
      )
    }
  }, [])

  // -------------------------------------------------------------------------
  // Remove (optimistic)
  // -------------------------------------------------------------------------

  const remove = useCallback(
    async (id: string) => {
      if (!isSupabaseConfigured) return
      // Snapshot the task before removing so we can restore on failure
      const snapshot = tasksRef.current.find((t) => t.id === id)

      // Optimistic removal
      setTasks((prev) => prev.filter((t) => t.id !== id))

      try {
        await deleteTask(id)
      } catch (err) {
        console.error('[useTasks] Failed to delete task:', err)
        // Restore the removed task at its original position
        if (snapshot) {
          setTasks((prev) => [snapshot, ...prev])
        }
      }
    },
    [],
  )

  return { tasks, status, add, toggleDone, remove }
}
