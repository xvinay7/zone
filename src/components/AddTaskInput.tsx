// AddTaskInput — text field with category picker and add button.

import { useState, type FormEvent } from 'react'
import type { TaskCategory } from '../types'
import Button from './ui/Button'
import Input from './ui/Input'

const CATEGORIES: { value: TaskCategory; label: string; emoji: string }[] = [
  { value: 'grocery',  label: 'Grocery',  emoji: '🛒' },
  { value: 'pharmacy', label: 'Pharmacy', emoji: '💊' },
  { value: 'errand',   label: 'Errand',   emoji: '📦' },
  { value: 'other',    label: 'Other',    emoji: '📌' },
]

export interface AddTaskInputProps {
  onAdd: (title: string, category: TaskCategory) => void
  placeholder?: string
  buttonLabel?: string
  disabled?: boolean
}

export default function AddTaskInput({
  onAdd,
  placeholder = 'What do you need to do?',
  buttonLabel = 'Add',
  disabled = false,
}: AddTaskInputProps) {
  const [value, setValue] = useState('')
  const [category, setCategory] = useState<TaskCategory>('other')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed, category)
    setValue('')
    setCategory('other')
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Task title"
        />
        <Button type="submit" disabled={disabled || value.trim().length === 0}>
          {buttonLabel}
        </Button>
      </form>

      {/* Category pill selector */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Task category">
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat.value
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 ${
                isSelected
                  ? 'bg-accent text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span aria-hidden="true">{cat.emoji}</span>
              {cat.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
