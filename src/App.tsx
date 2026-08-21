import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AddTaskInput from './components/AddTaskInput'
import Map from './components/Map'
import SettingsPanel from './components/SettingsPanel'
import TaskList from './components/TaskList'
import WhileImHereCard from './components/WhileImHereCard'
import ZoneManager from './components/ZoneManager'
import { DEFAULT_SETTINGS, NEARBY_THRESHOLD_METRES } from './data/fakeTasks'
import { haversineDistance } from './hooks/useProximity'
import { useAuth } from './hooks/useAuth'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTasks } from './hooks/useTasks'
import { useZones } from './hooks/useZones'
import { shortenPlaceName } from './lib/format'
import type { NearbyStore, TaskCategory } from './types'
import type { LatLng } from './types/location'

const DEFAULT_CENTER: LatLng = { lat: 12.9716, lng: 77.5946 }

function App() {
  const { userId } = useAuth()
  const { tasks, status: taskStatus, add: addTask, toggleDone, remove: removeTask } = useTasks(userId)
  const { zones, status: zoneStatus, add: addZone, remove: removeZone } = useZones(userId)

  const [maxSuggestionsPerDay, setMaxSuggestionsPerDay] = useLocalStorage(
    'remind_max_suggestions',
    DEFAULT_SETTINGS.maxSuggestionsPerDay,
  )

  // Track the simulated pin location from the Map component.
  const [simulatedLocation, setSimulatedLocation] = useState<LatLng>(DEFAULT_CENTER)

  // Track the last selected place (from PlaceSearch) so new tasks can be
  // pre-populated with a meaningful place and its geographic coordinates.
  const [currentPlace, setCurrentPlace] = useState<{
    name: string
    lat: number
    lng: number
  } | null>(null)

  // Dynamic proximity detection:
  // Find which pending tasks have coordinates that are physically nearby.
  const nearbyUserTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.status === 'done') return false

      if (task.zoneId) {
        const zone = zones.find((z) => z.id === task.zoneId)
        if (zone) {
          const d = haversineDistance(simulatedLocation, {
            lat: zone.lat,
            lng: zone.lng,
          })
          return d <= zone.radius
        }
        return false
      }

      if (task.lat !== undefined && task.lng !== undefined) {
        const d = haversineDistance(simulatedLocation, {
          lat: task.lat,
          lng: task.lng,
        })
        return d <= NEARBY_THRESHOLD_METRES
      }
      return false
    })
  }, [tasks, zones, simulatedLocation])

  // If we have nearby tasks, group them by place name. We'll pick the most common place.
  // In a real app with multiple nearby locations, you might surface multiple cards.
  const nearbyStoreName = useMemo(() => {
    if (nearbyUserTasks.length === 0) return null
    const counts = new globalThis.Map<string, number>()
    let maxName = nearbyUserTasks[0].place
    let maxCount = 0

    for (const task of nearbyUserTasks) {
      const c = (counts.get(task.place) || 0) + 1
      counts.set(task.place, c)
      if (c > maxCount) {
        maxCount = c
        maxName = task.place
      }
    }
    return maxName
  }, [nearbyUserTasks])

  const distanceMetres = useMemo(() => {
    if (!nearbyStoreName) return null
    const task = nearbyUserTasks.find((t) => t.place === nearbyStoreName)
    if (!task) return null

    if (task.zoneId) {
      const zone = zones.find((z) => z.id === task.zoneId)
      if (zone) {
        return haversineDistance(simulatedLocation, { lat: zone.lat, lng: zone.lng })
      }
    }

    if (task.lat !== undefined && task.lng !== undefined) {
      return haversineDistance(simulatedLocation, { lat: task.lat, lng: task.lng })
    }
    return null
  }, [nearbyStoreName, nearbyUserTasks, simulatedLocation, zones])

  const nearStore = nearbyStoreName !== null

  // Construct a dynamic NearbyStore object for the card based on actual data
  const storeForCard: NearbyStore | null = useMemo(() => {
    if (!nearbyStoreName) return null
    const tasksForStore = nearbyUserTasks.filter((t) => t.place === nearbyStoreName)
    return {
      name: nearbyStoreName,
      taskCount: tasksForStore.length,
      extraMinutes: Math.round(tasksForStore.length * 4.5), // fake extra minutes calculation
      whyNow: "You're nearby, making this a great time to cross these off your list.",
    }
  }, [nearbyStoreName, nearbyUserTasks])

  // Only show tasks in the card that match the chosen nearby store
  const cardTasks = useMemo(() => {
    if (!nearbyStoreName) return []
    return nearbyUserTasks.filter((t) => t.place === nearbyStoreName)
  }, [nearbyStoreName, nearbyUserTasks])

  const nearbyStatus = nearStore && cardTasks.length > 0 ? 'ready' : ('empty' as const)
  const settingsStatus = 'ready' as const

  // Proximity Alert Notification Engine
  const lastNotifiedStoreRef = useRef<string | null>(null)

  useEffect(() => {
    if (!nearbyStoreName) {
      // User is no longer near any store. Reset the tracking so they can be 
      // notified again if they leave and later re-enter the radius.
      lastNotifiedStoreRef.current = null
      return
    }

    // Only notify if we transition OUTSIDE -> INSIDE a specific store.
    // This prevents spamming notifications on every GPS update while inside.
    if (nearbyStoreName !== lastNotifiedStoreRef.current) {
      lastNotifiedStoreRef.current = nearbyStoreName

      if ('Notification' in window && Notification.permission === 'granted') {
        const taskCount = cardTasks.length
        const taskText = taskCount === 1 ? '1 task' : `${taskCount} tasks`
        
        new Notification(`You're near ${nearbyStoreName}`, {
          body: `You have ${taskText} to do here.`,
        })
      }
    }
  }, [nearbyStoreName, cardTasks])

  const handleSimulatedLocationChange = useCallback((location: LatLng) => {
    setSimulatedLocation(location)
  }, [])

  const handleRealLocationChange = useCallback((location: LatLng) => {
    setSimulatedLocation(location)
  }, [])

  function handleAdd(title: string, category: TaskCategory, zoneId?: string) {
    if (zoneId) {
      const zone = zones.find((z) => z.id === zoneId)
      if (zone) {
        void addTask(title, category, { name: zone.name, lat: zone.lat, lng: zone.lng, zoneId })
        return
      }
    }
    void addTask(title, category, currentPlace)
  }

  function handleToggleDone(id: string) {
    void toggleDone(id)
  }

  function handleDelete(id: string) {
    void removeTask(id)
  }

  // Format distance for display: metres below 1 km, km above.
  const distanceLabel =
    distanceMetres !== null
      ? distanceMetres < 1000
        ? `${Math.round(distanceMetres)} m`
        : `${(distanceMetres / 1000).toFixed(1)} km`
      : ''

  // Split tasks into pending and completed for separate sections.
  const pendingTasks = useMemo(() => tasks.filter((t) => t.status !== 'done'), [tasks])
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'done'), [tasks])

  return (
    <div className="min-h-svh bg-stone-50 font-sans text-stone-900">
      <div className="mx-auto max-w-md px-5 pb-16 pt-10">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            Remind
          </h1>
          <p className="mt-1 text-base text-stone-400">
            Tasks that fit where you are.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">
            Map
          </h2>
          <Map
            onSimulatedLocationChange={handleSimulatedLocationChange}
            onRealLocationChange={handleRealLocationChange}
            onPlaceSelect={setCurrentPlace}
          />
        </section>

        <section className="mb-10">
          <ZoneManager
            zones={zones}
            status={zoneStatus}
            onAddZone={addZone}
            onDeleteZone={removeZone}
            currentPlace={currentPlace}
          />
        </section>

        {/* Proximity indicator */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm">
          <span
            className={`size-2.5 shrink-0 rounded-full transition-colors ${nearStore ? 'bg-green-400' : 'bg-stone-300'}`}
            aria-hidden="true"
          />
          <span className="text-stone-600">
            {nearStore ? (
              <>
                You&apos;re near <strong>{shortenPlaceName(nearbyStoreName)}</strong> (
                {distanceLabel} away)
              </>
            ) : (
              <>
                You have <strong>{tasks.filter((t) => t.status !== 'done').length}</strong> pending tasks —
                drag the map pin near them to see suggestions.
              </>
            )}
          </span>
        </div>

        <div className="mb-6">
          <AddTaskInput
            onAdd={handleAdd}
            zones={zones}
            placeholder={
              currentPlace
                ? `Add a task for ${shortenPlaceName(currentPlace.name)}…`
                : 'What do you need to do?'
            }
          />
          {currentPlace && (
            <p className="mt-1.5 text-xs text-stone-400">
              <span className="font-medium text-stone-600">
                📍 {shortenPlaceName(currentPlace.name)}
              </span>
              {' '}
              &middot;{' '}
              <button
                type="button"
                className="text-accent underline underline-offset-2 hover:no-underline"
                onClick={() => setCurrentPlace(null)}
              >
                clear
              </button>
            </p>
          )}
        </div>

        {/* WhileImHereCard — driven by user's own tasks physically nearby */}
        {nearStore && storeForCard && (
          <div className="mb-8">
            <WhileImHereCard
              store={storeForCard}
              tasks={cardTasks}
              status={nearbyStatus}
              emptyMessage={`No tasks assigned to ${shortenPlaceName(nearbyStoreName)} yet.`}
              onToggleDone={handleToggleDone}
            />
          </div>
        )}

        <section className="mb-10">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-stone-400">
            Your tasks
          </h2>
          <TaskList
            tasks={pendingTasks}
            status={taskStatus}
            emptyMessage="No pending tasks. Add one above."
            onToggleDone={handleToggleDone}
            onDelete={handleDelete}
          />
        </section>

        {completedTasks.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">
              Completed
            </h2>
            <TaskList
              tasks={completedTasks}
              status={taskStatus}
              onToggleDone={handleToggleDone}
              onDelete={handleDelete}
            />
          </section>
        )}

        <SettingsPanel
          settings={{ maxSuggestionsPerDay }}
          status={settingsStatus}
          onMaxSuggestionsChange={setMaxSuggestionsPerDay}
        />
      </div>
    </div>
  )
}

export default App
