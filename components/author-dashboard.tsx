"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Scroll, LogOut, Edit3, Upload } from "lucide-react"
import type { Tale } from "@/lib/types"

interface AuthorDashboardProps {
  onLogout: () => void
}

export function AuthorDashboard({ onLogout }: AuthorDashboardProps) {
  const [tales, setTales] = useState<Tale[]>([])
  const [editingTale, setEditingTale] = useState<Tale | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadTales()
  }, [])

  const loadTales = async () => {
    try {
      const { getTales } = await import("@/lib/store")
      const allTales = getTales()
      setTales(allTales)
    } catch (error) {
      console.error("[v0] Error loading tales:", error)
    }
  }

  const updateTale = async (updatedTale: Tale) => {
    try {
      const { getTales, saveTales } = await import("@/lib/store")
      const allTales = getTales()
      const index = allTales.findIndex((t) => t.id === updatedTale.id)
      if (index !== -1) {
        allTales[index] = updatedTale
        saveTales(allTales)
        setTales(allTales)
        setEditingTale(null)
        window.dispatchEvent(new Event("tales-updated"))
      }
    } catch (error) {
      console.error("[v0] Error updating tale:", error)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 overflow-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 sticky top-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <Scroll className="h-6 w-6 text-amber-600" />
              <h1 className="text-2xl font-serif font-bold">Панель редактирования</h1>
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </div>

          {/* Tales Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tales.map((tale) => (
              <Card key={tale.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-serif text-lg line-clamp-2">{tale.title}</CardTitle>
                  <CardDescription className="text-xs">{tale.publishedDate}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {tale.summary}
                  </p>
                  <EditTaleDialog
                    tale={tale}
                    onSave={updateTale}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EditTaleDialog({ tale, onSave }: { tale: Tale; onSave: (tale: Tale) => void }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(tale)

  const handleSave = () => {
    onSave(formData)
    setOpen(false)
  }

  const handleFieldChange = (field: keyof Tale, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        handleFieldChange("image", base64)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2 w-full">
          <Edit3 className="h-4 w-4" />
          Редактировать
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактирование рассказа</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Основное</TabsTrigger>
            <TabsTrigger value="content">Содержание</TabsTrigger>
            <TabsTrigger value="image">Изображение</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Название</label>
              <Input
                value={formData.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Название рассказа"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Дата публикации</label>
              <Input
                type="date"
                value={formData.publishedDate}
                onChange={(e) => handleFieldChange("publishedDate", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Время чтения</label>
              <Input
                value={formData.readingTime}
                onChange={(e) => handleFieldChange("readingTime", e.target.value)}
                placeholder="например: 5 min read"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Аннотация</label>
              <Textarea
                value={formData.summary}
                onChange={(e) => handleFieldChange("summary", e.target.value)}
                placeholder="Краткое описание рассказа"
                rows={4}
              />
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Текст рассказа</label>
              <Textarea
                value={formData.fullText}
                onChange={(e) => handleFieldChange("fullText", e.target.value)}
                placeholder="Полный текст рассказа"
                rows={12}
              />
            </div>
          </TabsContent>

          {/* Image Tab */}
          <TabsContent value="image" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Загрузить изображение</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                <Upload className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 mt-1">или введите URL вручную</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">URL изображения</label>
              <Input
                value={formData.image}
                onChange={(e) => handleFieldChange("image", e.target.value)}
                placeholder="/path/to/image.jpg или https://..."
              />
            </div>
            {formData.image && (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                <img
                  src={formData.image}
                  alt={formData.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("[v0] Error loading image:", e)
                  }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setFormData(tale)
              setOpen(false)
            }}
          >
            Отменить
          </Button>
          <Button onClick={handleSave}>
            Сохранить изменения
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
