import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'accent'
  children: ReactNode
}

const variantStyles = {
  default: 'border-stone-200 bg-white',
  accent: 'border-accent/20 bg-accent-soft',
}

export default function Card({
  variant = 'default',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={cn('rounded-2xl border p-5', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </section>
  )
}
