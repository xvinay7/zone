import { cn } from '../../lib/cn'

export interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-stone-200/80', className)}
      aria-hidden="true"
    />
  )
}
