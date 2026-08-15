import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: ReactNode
  value: number
  min?: number
  max?: number
  step?: number
  valueLabel?: string
  onChange: (value: number) => void
}

export default function Slider({
  label,
  value,
  min = 0,
  max = 10,
  step = 1,
  valueLabel,
  className,
  onChange,
  ...props
}: SliderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-base text-stone-700">{label}</span>
        <span className="text-sm font-medium tabular-nums text-accent">
          {valueLabel ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        {...props}
      />
    </div>
  )
}
