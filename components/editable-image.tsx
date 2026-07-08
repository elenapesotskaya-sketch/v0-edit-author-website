"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useEditMode } from "@/contexts/edit-mode-context"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface EditableImageProps {
  src: string
  alt: string
  onChange: (src: string) => void
  className?: string
  aspectRatio?: string
}

export function EditableImage({ src, alt, onChange, className, aspectRatio = "aspect-video" }: EditableImageProps) {
  const { isEditMode } = useEditMode()
  const [imageUrl, setImageUrl] = useState(src)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUrlChange = () => {
    if (inputRef.current?.value) {
      onChange(inputRef.current.value)
      setImageUrl(inputRef.current.value)
      setShowUrlInput(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        onChange(dataUrl)
        setImageUrl(dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className={cn("relative group", aspectRatio, className)}>
      <Image src={imageUrl || "/placeholder.svg"} alt={alt} fill className="object-cover rounded-lg" />

      {isEditMode && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
          <Button size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowUrlInput(true)}>
            URL
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>
      )}

      {showUrlInput && (
        <div className="absolute inset-0 bg-background/95 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Enter Image URL</h3>
            <Button size="icon" variant="ghost" onClick={() => setShowUrlInput(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <input
            ref={inputRef}
            type="text"
            defaultValue={imageUrl}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border rounded-md"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUrlChange()
              if (e.key === "Escape") setShowUrlInput(false)
            }}
          />
          <div className="flex gap-2">
            <Button onClick={handleUrlChange} className="flex-1">
              Save
            </Button>
            <Button variant="outline" onClick={() => setShowUrlInput(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
