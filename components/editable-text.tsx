"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useEditMode } from "@/contexts/edit-mode-context"
import { cn } from "@/lib/utils"

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  className?: string
  multiline?: boolean
  placeholder?: string
}

export function EditableText({
  value,
  onChange,
  className,
  multiline = false,
  placeholder = "Click to edit...",
}: EditableTextProps) {
  const { isEditMode } = useEditMode()
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (multiline && inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.setSelectionRange(localValue.length, localValue.length)
      }
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    if (localValue !== value) {
      onChange(localValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === "Escape") {
      setLocalValue(value)
      setIsEditing(false)
    }
  }

  if (!isEditMode) {
    return <span className={className}>{value}</span>
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn("w-full resize-none bg-background border border-primary rounded px-2 py-1", className)}
          rows={Math.min(localValue.split("\n").length + 1, 20)}
        />
      )
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn("bg-background border border-primary rounded px-2 py-1", className)}
      />
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer hover:bg-accent hover:outline hover:outline-2 hover:outline-primary/50 rounded px-1 transition-colors",
        !value && "text-muted-foreground italic",
        className,
      )}
    >
      {value || placeholder}
    </span>
  )
}
