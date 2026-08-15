export interface SpinnerProps {
  label?: string
}

export default function Spinner({ label = 'Loading' }: SpinnerProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12"
      role="status"
      aria-live="polite"
    >
      <div className="size-6 animate-spin rounded-full border-2 border-stone-200 border-t-accent" />
      <p className="text-sm text-stone-400">{label}</p>
    </div>
  )
}
