import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  fullWidth?: boolean
  children: ReactNode
}

const variantStyles = {
  primary:
    'bg-accent text-white hover:bg-blue-700 active:bg-blue-800 border border-transparent',
  secondary:
    'bg-white text-stone-600 border border-stone-200 hover:border-stone-300',
  ghost: 'bg-transparent text-accent hover:bg-accent-soft border border-transparent',
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl px-5 py-3 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
