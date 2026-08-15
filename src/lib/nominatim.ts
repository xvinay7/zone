import type { PlaceResult } from '../types/location'

const NOMINATIM_BASE =
  import.meta.env.VITE_NOMINATIM_BASE_URL ?? '/api/nominatim'

const APP_USER_AGENT =
  import.meta.env.VITE_APP_USER_AGENT ??
  'Remind/1.0 (task-bundling app; https://github.com/remind-app)'

/** Enforces Nominatim's max 1 request per second policy. */
let lastRequestAt = 0
let requestChain: Promise<void> = Promise.resolve()

function scheduleRateLimitedRequest<T>(request: () => Promise<T>): Promise<T> {
  const run = async () => {
    const elapsed = Date.now() - lastRequestAt
    if (elapsed < 1000) {
      await new Promise((resolve) => window.setTimeout(resolve, 1000 - elapsed))
    }
    lastRequestAt = Date.now()
    return request()
  }

  const next = requestChain.then(run, run)
  requestChain = next.then(
    () => undefined,
    () => undefined,
  )
  return next
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  return scheduleRateLimitedRequest(async () => {
    const params = new URLSearchParams({
      q: trimmed,
      format: 'json',
      addressdetails: '0',
      limit: '5',
    })

    const response = await fetch(`${NOMINATIM_BASE}/search?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': APP_USER_AGENT,
      },
    })

    if (!response.ok) {
      throw new Error(`Nominatim request failed (${response.status})`)
    }

    const results = (await response.json()) as NominatimResult[]

    return results.map((result) => ({
      placeId: String(result.place_id),
      name: result.display_name,
      lat: Number(result.lat),
      lng: Number(result.lon),
    }))
  })
}
