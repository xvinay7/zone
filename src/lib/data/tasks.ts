import { supabase } from '../supabase/client'
import {
  DataError,
  type TaskInsert,
  type TaskRow,
  type TaskStatus,
} from '../supabase/database.types'

export type NewTask = Pick<
  TaskInsert,
  'user_id' | 'title' | 'category' | 'place_name' | 'lat' | 'lng' | 'zone_id'
>

export async function getTasks(userId: string): Promise<TaskRow[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new DataError('Failed to fetch tasks.', error)
    }

    return data ?? []
  } catch (error) {
    if (error instanceof DataError) throw error
    throw new DataError('Unexpected error while fetching tasks.', error)
  }
}

export async function addTask(task: NewTask): Promise<TaskRow> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: task.user_id,
        title: task.title.trim(),
        category: task.category ?? 'other',
        place_name: task.place_name ?? 'Unassigned',
        lat: task.lat ?? null,
        lng: task.lng ?? null,
        status: 'pending',
        zone_id: task.zone_id ?? null,
      })
      .select()
      .single()

    if (error) {
      throw new DataError('Failed to add task.', error)
    }

    if (!data) {
      throw new DataError('Task was not returned after insert.')
    }

    return data
  } catch (error) {
    if (error instanceof DataError) throw error
    throw new DataError('Unexpected error while adding task.', error)
  }
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<TaskRow> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new DataError('Failed to update task status.', error)
    }

    if (!data) {
      throw new DataError('Task not found or not accessible.')
    }

    return data
  } catch (error) {
    if (error instanceof DataError) throw error
    throw new DataError('Unexpected error while updating task status.', error)
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      throw new DataError('Failed to delete task.', error)
    }
  } catch (error) {
    if (error instanceof DataError) throw error
    throw new DataError('Unexpected error while deleting task.', error)
  }
}
