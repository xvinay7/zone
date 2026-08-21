import { supabase } from '../supabase/client'
import type { ZoneRow, ZoneInsert, ZoneUpdate } from '../supabase/database.types'

export async function getZones(userId: string): Promise<ZoneRow[]> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch zones: ${error.message}`)
  }

  return data
}

export async function addZone(insert: ZoneInsert): Promise<ZoneRow> {
  const { data, error } = await supabase
    .from('zones')
    .insert(insert)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add zone: ${error.message}`)
  }

  return data
}

export async function updateZone(id: string, updates: ZoneUpdate): Promise<ZoneRow> {
  const { data, error } = await supabase
    .from('zones')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update zone: ${error.message}`)
  }

  return data
}

export async function deleteZone(id: string): Promise<void> {
  const { error } = await supabase
    .from('zones')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete zone: ${error.message}`)
  }
}
