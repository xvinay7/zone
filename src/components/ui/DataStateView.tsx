import type { ReactNode } from 'react'
import type { DataStatus } from '../../types'
import Spinner from './Spinner'

export interface DataStateViewProps {
  status: DataStatus
  errorMessage?: string
  emptyMessage?: string
  loadingLabel?: string
  isEmpty?: boolean
  loadingFallback?: ReactNode
  children: ReactNode
}

function DefaultError({ message }: { message: string }) {
  return (
    <p className="py-12 text-center text-base text-red-500" role="alert">
      {message}
    </p>
  )
}

function DefaultEmpty({ message }: { message: string }) {
  return (
    <p className="py-12 text-center text-base text-stone-400">{message}</p>
  )
}

export default function DataStateView({
  status,
  errorMessage = 'Something went wrong. Please try again.',
  emptyMessage = 'Nothing here yet.',
  loadingLabel = 'Loading',
  isEmpty = false,
  loadingFallback,
  children,
}: DataStateViewProps) {
  if (status === 'loading') {
    return <>{loadingFallback ?? <Spinner label={loadingLabel} />}</>
  }

  if (status === 'error') {
    return <DefaultError message={errorMessage} />
  }

  if (status === 'empty' || isEmpty) {
    return <DefaultEmpty message={emptyMessage} />
  }

  return <>{children}</>
}
