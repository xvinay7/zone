// SettingsPanel — displays app preferences such as max suggestions per day.

import { useEffect, useState } from 'react'
import type { AppSettings, DataStatus } from '../types'
import Button from './ui/Button'
import Card from './ui/Card'
import DataStateView from './ui/DataStateView'
import Skeleton from './ui/Skeleton'
import Slider from './ui/Slider'

export interface SettingsPanelProps {
  settings: AppSettings
  status: DataStatus
  onMaxSuggestionsChange: (value: number) => void
  errorMessage?: string
  emptyMessage?: string
  loadingLabel?: string
  minSuggestions?: number
  maxSuggestions?: number
}

function SettingsPanelSkeleton() {
  return (
    <Card aria-hidden="true">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-6 h-5 w-full" />
      <Skeleton className="mt-4 h-2 w-full rounded-full" />
    </Card>
  )
}

export default function SettingsPanel({
  settings,
  status,
  onMaxSuggestionsChange,
  errorMessage = 'We couldn\u2019t load your settings.',
  emptyMessage = 'No settings available yet.',
  loadingLabel = 'Loading settings',
  minSuggestions = 0,
  maxSuggestions = 10,
}: SettingsPanelProps) {
  return (
    <DataStateView
      status={status}
      errorMessage={errorMessage}
      emptyMessage={emptyMessage}
      loadingLabel={loadingLabel}
      loadingFallback={<SettingsPanelSkeleton />}
    >
      <Card>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
          Settings
        </h2>

        <div className="mt-6">
          <Slider
            label="Max suggestions per day"
            value={settings.maxSuggestionsPerDay}
            min={minSuggestions}
            max={maxSuggestions}
            valueLabel={`${settings.maxSuggestionsPerDay} / day`}
            onChange={onMaxSuggestionsChange}
            aria-label="Max suggestions per day"
          />
        </div>

        <div className="mt-6 border-t border-stone-100 pt-6">
          <p className="text-sm font-medium text-stone-900">Proximity Alerts</p>
          <p className="mt-1 text-sm text-stone-600">
            Get notified when you are physically near your pending tasks.
          </p>
          <div className="mt-4">
            <PermissionControl />
          </div>
        </div>
      </Card>
    </DataStateView>
  )
}

function PermissionControl() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported')
    } else {
      setPermission(Notification.permission)
    }
  }, [])

  async function handleRequest() {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  if (permission === 'unsupported') {
    return <p className="text-sm text-stone-400">Notifications not supported in this browser.</p>
  }

  if (permission === 'granted') {
    return <p className="text-sm text-green-600 font-medium">Notifications enabled.</p>
  }

  if (permission === 'denied') {
    return <p className="text-sm text-red-500">Notifications blocked by browser.</p>
  }

  return (
    <Button variant="secondary" onClick={handleRequest}>
      Enable notifications
    </Button>
  )
}
