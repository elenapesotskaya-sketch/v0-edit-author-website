"use client"

import { Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditMode } from "@/contexts/edit-mode-context"

export function EditModeToggle() {
  const { isEditMode, toggleEditMode } = useEditMode()

  return (
    <Button
      onClick={toggleEditMode}
      variant={isEditMode ? "default" : "outline"}
      size="sm"
      className="fixed top-4 right-4 z-50 gap-2"
    >
      {isEditMode ? (
        <>
          <Eye className="h-4 w-4" />
          View Mode
        </>
      ) : (
        <>
          <Edit className="h-4 w-4" />
          Edit Mode
        </>
      )}
    </Button>
  )
}
