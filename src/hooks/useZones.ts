import { useCallback, useEffect, useRef, useState } from 'react'
import { addZone, deleteZone, getZones, updateZone } from '../lib/data/zones'
import { isSupabaseConfigured } from '../lib/supabase/client'
import type { ZoneRow } from '../lib/supabase/database.types'
import type { DataStatus, Zone } from '../types'

function rowToZone(row: ZoneRow): Zone {
  return {
    id: row.id,
    name: row.name,
    lat: row.lat,
    lng: row.lng,
    radius: row.radius_m,
  }
}

export interface UseZonesResult {
  zones: Zone[]
  status: DataStatus
  add: (name: string, lat: number, lng: number, radius: number) => Promise<void>
  update: (id: string, updates: Partial<Omit<Zone, 'id'>>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export function useZones(userId: string | null): UseZonesResult {
  const [zones, setZones] = useState<Zone[]>([])
  const [status, setStatus] = useState<DataStatus>('loading')

  const zonesRef = useRef<Zone[]>(zones)
  useEffect(() => {
    zonesRef.current = zones
  }, [zones])

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
        const rows = await getZones(userId!)
        if (!cancelled) {
          setZones(rows.map(rowToZone))
          setStatus(rows.length === 0 ? 'empty' : 'ready')
        }
      } catch (err) {
        console.error('[useZones] Failed to load zones:', err)
        if (!cancelled) setStatus('error')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const add = useCallback(
    async (name: string, lat: number, lng: number, radius: number) => {
      if (!isSupabaseConfigured || !userId) return
      try {
        const row = await addZone({
          user_id: userId,
          name: name.trim(),
          lat,
          lng,
          radius_m: radius,
        })
        setZones((prev) => [rowToZone(row), ...prev])
        setStatus('ready')
      } catch (err) {
        console.error('[useZones] Failed to add zone:', err)
      }
    },
    [userId],
  )

  const update = useCallback(async (id: string, updates: Partial<Omit<Zone, 'id'>>) => {
    if (!isSupabaseConfigured) return
    const snapshot = zonesRef.current.find((z) => z.id === id)
    if (!snapshot) return

    // Optimistic
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, ...updates } : z)),
    )

    try {
      const payload: any = {}
      if (updates.name !== undefined) payload.name = updates.name.trim()
      if (updates.lat !== undefined) payload.lat = updates.lat
      if (updates.lng !== undefined) payload.lng = updates.lng
      if (updates.radius !== undefined) payload.radius_m = updates.radius

      await updateZone(id, payload)
    } catch (err) {
      console.error('[useZones] Failed to update zone:', err)
      setZones((prev) => prev.map((z) => (z.id === id ? snapshot : z)))
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) return
    const snapshot = zonesRef.current.find((z) => z.id === id)

    // Optimistic
    setZones((prev) => prev.filter((z) => z.id !== id))

    try {
      await deleteZone(id)
    } catch (err) {
      console.error('[useZones] Failed to delete zone:', err)
      if (snapshot) {
        setZones((prev) => [snapshot, ...prev])
      }
    }
  }, [])

  return { zones, status, add, update, remove }
}
