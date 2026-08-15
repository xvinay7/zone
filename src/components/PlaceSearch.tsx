// PlaceSearch — debounced OpenStreetMap Nominatim lookup with selectable dropdown results.

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { searchPlaces } from '../lib/nominatim'
import type { PlaceResult } from '../types/location'
import Input from './ui/Input'

export interface PlaceSearchProps {
  onSelect: (place: PlaceResult) => void
  placeholder?: string
}

export default function PlaceSearch({
  onSelect,
  placeholder = 'Search for a place…',
}: PlaceSearchProps) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  const debouncedQuery = useDebouncedValue(query, 400)

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([])
      setError(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function runSearch() {
      setIsLoading(true)
      setError(null)

      try {
        const places = await searchPlaces(debouncedQuery)
        if (!cancelled) {
          setResults(places)
          setIsOpen(true)
          setActiveIndex(places.length > 0 ? 0 : -1)
        }
      } catch {
        if (!cancelled) {
          setResults([])
          setError('Could not search places right now.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void runSearch()

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(place: PlaceResult) {
    setQuery(place.name)
    setIsOpen(false)
    setActiveIndex(-1)
    onSelect(place)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % results.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1))
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      handleSelect(results[activeIndex])
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
      />

      {isLoading && (
        <p className="mt-2 text-sm text-stone-400">Searching…</p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      {isOpen && results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
        >
          {results.map((place, index) => (
            <li
              key={place.placeId}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(place)}
                className={`w-full px-4 py-3 text-left text-sm leading-snug transition-colors ${
                  index === activeIndex
                    ? 'bg-accent-soft text-stone-900'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                {place.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-xs text-stone-400">
        Search © OpenStreetMap contributors via Nominatim
      </p>
    </div>
  )
}
