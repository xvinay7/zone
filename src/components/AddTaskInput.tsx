// AddTaskInput — text field and button that calls onAdd with the trimmed title.

import { useState, type FormEvent } from 'react'
import Button from './ui/Button'
import Input from './ui/Input'

export interface AddTaskInputProps {
  onAdd: (title: string) => void
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
  }

  return (
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
  )
}
