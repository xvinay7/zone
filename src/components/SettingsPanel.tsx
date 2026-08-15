// SettingsPanel — displays app preferences such as max suggestions per day.

import type { AppSettings, DataStatus } from '../types'
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
      </Card>
    </DataStateView>
  )
}
