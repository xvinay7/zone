import { useState } from 'react'
import type { Zone, DataStatus } from '../types'
import { shortenPlaceName } from '../lib/format'

interface ZoneManagerProps {
  zones: Zone[]
  status: DataStatus
  onAddZone: (name: string, lat: number, lng: number, radius: number) => Promise<void>
  onDeleteZone: (id: string) => Promise<void>
  currentPlace: { name: string; lat: number; lng: number } | null
}

export default function ZoneManager({
  zones,
  status,
  onAddZone,
  onDeleteZone,
  currentPlace,
}: ZoneManagerProps) {
  const [radius, setRadius] = useState<number>(500)
  const [isAdding, setIsAdding] = useState(false)

  if (status === 'error') return null

  const handleAdd = async () => {
    if (!currentPlace) return
    setIsAdding(true)
    try {
      await onAddZone(currentPlace.name, currentPlace.lat, currentPlace.lng, radius)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm">
      <h3 className="mb-3 font-semibold text-stone-800">Familiar Zones</h3>
      
      {zones.length > 0 ? (
        <ul className="mb-4 space-y-2">
          {zones.map((z) => (
            <li key={z.id} className="flex items-center justify-between text-stone-600">
              <span>
                <strong>{shortenPlaceName(z.name)}</strong> <span className="text-stone-400">({z.radius}m)</span>
              </span>
              <button
                onClick={() => onDeleteZone(z.id)}
                className="text-red-500 hover:underline"
              >
                delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-stone-500">You haven't added any zones yet.</p>
      )}

      {currentPlace && (
        <div className="rounded-lg bg-stone-50 p-3">
          <p className="mb-2 font-medium text-stone-700">
            Save "{shortenPlaceName(currentPlace.name)}" as a Zone?
          </p>
          <div className="flex items-center gap-3">
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="rounded border border-stone-300 bg-white px-2 py-1 text-sm text-stone-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value={250}>250m Radius</option>
              <option value={500}>500m Radius</option>
              <option value={1000}>1km Radius</option>
            </select>
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="rounded bg-blue-600 px-3 py-1 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isAdding ? 'Saving...' : 'Save Zone'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
