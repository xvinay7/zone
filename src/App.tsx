import { useState } from 'react'
import AddTaskInput from './components/AddTaskInput'
import Map from './components/Map'
import SettingsPanel from './components/SettingsPanel'
import TaskList from './components/TaskList'
import WhileImHereCard from './components/WhileImHereCard'
import Button from './components/ui/Button'
import {
  DEFAULT_SETTINGS,
  INITIAL_TASKS,
  NEARBY_STORE,
  NEARBY_TASKS,
} from './data/fakeTasks'
import type { DataStatus, Task } from './types'

function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [nearStore, setNearStore] = useState(false)
  const [maxSuggestionsPerDay, setMaxSuggestionsPerDay] = useState(
    DEFAULT_SETTINGS.maxSuggestionsPerDay,
  )

  // Swap these to 'loading' | 'error' | 'empty' when wiring real data sources.
  const taskStatus: DataStatus = 'ready'
  const nearbyStatus: DataStatus = nearStore ? 'ready' : 'empty'
  const settingsStatus: DataStatus = 'ready'

  function handleAdd(title: string) {
    setTasks((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        title,
        category: 'other',
        place: 'Unassigned',
      },
    ])
  }

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
          <Map />
        </section>

        <div className="mb-6">
          <AddTaskInput onAdd={handleAdd} />
        </div>

        <div className="mb-8">
          <Button
            variant={nearStore ? 'primary' : 'secondary'}
            fullWidth
            onClick={() => setNearStore((previous) => !previous)}
            aria-pressed={nearStore}
          >
            Simulate: near the store
          </Button>
        </div>

        {nearStore && (
          <div className="mb-8">
            <WhileImHereCard
              store={NEARBY_STORE}
              tasks={NEARBY_TASKS}
              status={nearbyStatus}
            />
          </div>
        )}

        <section className="mb-10">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-stone-400">
            Your tasks
          </h2>
          <TaskList tasks={tasks} status={taskStatus} />
        </section>

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
