"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface EditModeContextType {
  isEditMode: boolean
  toggleEditMode: () => void
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined)

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem("edit-mode")
    if (saved === "true") {
      setIsEditMode(true)
    }
  }, [])

  const toggleEditMode = () => {
    setIsEditMode((prev) => {
      const newValue = !prev
      if (isClient) {
        localStorage.setItem("edit-mode", String(newValue))
      }
      return newValue
    })
  }

  return <EditModeContext.Provider value={{ isEditMode, toggleEditMode }}>{children}</EditModeContext.Provider>
}

export function useEditMode() {
  const context = useContext(EditModeContext)
  if (context === undefined) {
    throw new Error("useEditMode must be used within EditModeProvider")
  }
  return context
}
