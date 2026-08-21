// useProximity — returns the distance in metres between two LatLng points
// using the Haversine formula, and a boolean `isNear` flag.

import { useMemo } from 'react'
import type { LatLng } from '../types/location'

const EARTH_RADIUS_M = 6_371_000

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(sin2))
}

export interface UseProximityOptions {
  /** Location to test (e.g. the user's simulated pin). */
  from: LatLng
  /** Target location (e.g. a store). */
  to: LatLng
  /** Threshold in metres. Defaults to 500 m. */
  thresholdMetres?: number
}

export interface UseProximityResult {
  distanceMetres: number
  isNear: boolean
}

export function useProximity({
  from,
  to,
  thresholdMetres = 500,
}: UseProximityOptions): UseProximityResult {
  return useMemo(() => {
    const distanceMetres = haversineDistance(from, to)
    return { distanceMetres, isNear: distanceMetres <= thresholdMetres }
  }, [from.lat, from.lng, to.lat, to.lng, thresholdMetres])
}
