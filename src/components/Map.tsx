// Map — MapLibre map with OpenFreeMap tiles, place search, simulated draggable pin, and real geolocation.

import { Map as MaplibreMap, Marker, NavigationControl, type StyleSpecification } from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import type { LatLng, PlaceResult } from '../types/location'
import PlaceSearch from './PlaceSearch'
import Button from './ui/Button'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};
const DEFAULT_CENTER: LatLng = { lat: 37.7749, lng: -122.4194 }

export interface MapProps {
  initialCenter?: LatLng
  initialZoom?: number
  onSimulatedLocationChange?: (location: LatLng) => void
  onRealLocationChange?: (location: LatLng) => void
  /** Called whenever the user selects a named place (via search or geocoding). */
  onPlaceSelect?: (place: { name: string; lat: number; lng: number }) => void
}

function createMarkerElement(label: string, color: string): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex flex-col items-center gap-1'

  const badge = document.createElement('span')
  badge.textContent = label
  badge.className =
    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm'
  badge.style.backgroundColor = color

  const pin = document.createElement('div')
  pin.className = 'size-4 rounded-full border-2 border-white shadow-md'
  pin.style.backgroundColor = color

  wrapper.appendChild(badge)
  wrapper.appendChild(pin)
  return wrapper
}

export default function Map({
  initialCenter = DEFAULT_CENTER,
  initialZoom = 12,
  onSimulatedLocationChange,
  onRealLocationChange,
  onPlaceSelect,
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MaplibreMap | null>(null)
  const simulatedMarkerRef = useRef<Marker | null>(null)
  const realMarkerRef = useRef<Marker | null>(null)

  const [simulatedLocation, setSimulatedLocation] = useState<LatLng>(initialCenter)
  const [realLocation, setRealLocation] = useState<LatLng | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)
  const isFirstLocateRef = useRef(false)

  const onSimulatedLocationChangeRef = useRef(onSimulatedLocationChange)
  const onRealLocationChangeRef = useRef(onRealLocationChange)
  const onPlaceSelectRef = useRef(onPlaceSelect)

  useEffect(() => {
    onSimulatedLocationChangeRef.current = onSimulatedLocationChange
  }, [onSimulatedLocationChange])

  useEffect(() => {
    onRealLocationChangeRef.current = onRealLocationChange
  }, [onRealLocationChange])

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect
  }, [onPlaceSelect])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new MaplibreMap({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [initialCenter.lng, initialCenter.lat],
      zoom: initialZoom,
      attributionControl: { compact: true },
    })

    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')

    // Log any map errors (e.g., tile loading failures)
    map.on('error', (event) => {
      console.error('MapLibre error:', event.error)
    })

    const simulatedMarker = new Marker({
      element: createMarkerElement('SIMULATED LOCATION', '#d97706'),
      draggable: true,
      anchor: 'bottom',
    })
      .setLngLat([initialCenter.lng, initialCenter.lat])
      .addTo(map)

    simulatedMarker.on('drag', () => {
      const { lat, lng } = simulatedMarker.getLngLat()
      const next = { lat, lng }
      setSimulatedLocation(next)
      onSimulatedLocationChangeRef.current?.(next)
    })

    simulatedMarkerRef.current = simulatedMarker
    mapRef.current = map

    return () => {
      simulatedMarker.remove()
      realMarkerRef.current?.remove()
      map.remove()
      mapRef.current = null
      simulatedMarkerRef.current = null
      realMarkerRef.current = null
    }
  }, [initialCenter.lat, initialCenter.lng, initialZoom])

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  function flyTo(location: LatLng, zoom = 14) {
    mapRef.current?.flyTo({
      center: [location.lng, location.lat],
      zoom,
      essential: true,
    })
  }

  function handlePlaceSelect(place: PlaceResult) {
    const next = { lat: place.lat, lng: place.lng }
    simulatedMarkerRef.current?.setLngLat([place.lng, place.lat])
    setSimulatedLocation(next)
    onSimulatedLocationChangeRef.current?.(next)
    // Propagate the human-readable place name and coords up so App can use it
    onPlaceSelectRef.current?.({ name: place.name, lat: place.lat, lng: place.lng })
    flyTo(next)
  }

  function handleUseRealLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.')
      return
    }

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setIsLocating(false)
      return
    }

    setIsLocating(true)
    setGeoError(null)
    isFirstLocateRef.current = true

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setRealLocation(next)
        onRealLocationChangeRef.current?.(next)
        
        // Only fly on the first successful location update
        if (isFirstLocateRef.current) {
            flyTo(next, 15)
            isFirstLocateRef.current = false
        }

        if (realMarkerRef.current) {
          realMarkerRef.current.setLngLat([next.lng, next.lat])
        } else if (mapRef.current) {
          realMarkerRef.current = new Marker({
            element: createMarkerElement('REAL LOCATION', '#2563eb'),
            draggable: false,
            anchor: 'bottom',
          })
            .setLngLat([next.lng, next.lat])
            .addTo(mapRef.current)
        }

        setIsLocating(false)
      },
      (error) => {
        setIsLocating(false)
        setWatchId(null)
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Allow access to use your real location.')
          return
        }
        setGeoError('Could not determine your location. Try again.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
    
    setWatchId(id)
  }

  return (
    <section className="space-y-4">
      <PlaceSearch onSelect={handlePlaceSelect} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
            Simulated location
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Drag the amber pin on the map to test nearby suggestions.
          </p>
          <p className="mt-1 text-xs tabular-nums text-stone-400">
            {simulatedLocation.lat.toFixed(5)}, {simulatedLocation.lng.toFixed(5)}
          </p>
        </div>

        <Button
          variant="secondary"
          fullWidth
          className="sm:w-auto sm:self-stretch"
          onClick={handleUseRealLocation}
        >
          {watchId !== null
            ? 'Stop tracking location'
            : isLocating
              ? 'Locating…'
              : 'Use my real location (REAL)'}
        </Button>
      </div>

      {realLocation && (
        <p className="text-xs tabular-nums text-accent">
          Real location: {realLocation.lat.toFixed(5)}, {realLocation.lng.toFixed(5)}
        </p>
      )}

      {geoError && (
        <p className="text-sm text-red-500" role="alert">
          {geoError}
        </p>
      )}

      <div
        ref={mapContainerRef}
        className="map-shell h-80 w-full overflow-hidden rounded-2xl border border-stone-200 shadow-sm"
        aria-label="Interactive map"
      />
    </section>
  )
}
