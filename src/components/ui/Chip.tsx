import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  label: string
  variant?: 'default' | 'accent'
}

const variantStyles = {
  default: 'bg-stone-100 text-stone-600',
  accent: 'bg-accent-soft text-accent',
}

export default function Chip({
  label,
  variant = 'accent',
  className,
  ...props
}: ChipProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {label}
    </span>
  )
}
