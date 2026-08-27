"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Scroll, LogOut, Edit3, Upload, Trash2, Bold, Italic, Plus, MessageCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

  const [isSaving, setIsSaving] = useState(false)

  const saveChanges = async () => {
    setIsSaving(true)
    try {
      const { getAuthorInfo } = await import("@/lib/store")
      const authorInfo = await getAuthorInfo()

      const response = await fetch("/api/admin/save-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tales, author: authorInfo }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`✓ Изменения сохранены на GitHub!\nКоммит: ${result.commit}`)
      } else {
        alert(`✗ Ошибка при сохранении: ${result.message}`)
      }
    } catch (error) {
      alert(`✗ Ошибка сети: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    onLogout()
  }

  const loadTales = async () => {
    try {
      const { getTales } = await import("@/lib/store")
      const allTales = getTales()
      setTales(allTales)
    } catch (error) {
      console.error("[v0] Error loading tales:", error)
    }
  }

  const createTale = async (newTale: Tale) => {
    try {
      const { getTales, saveTales } = await import("@/lib/store")
      const allTales = [...getTales(), newTale]
      await saveTales(allTales)
      setTales(allTales)
      window.dispatchEvent(new Event("tales-updated"))
    } catch (error) {
      console.error("[v0] Error creating tale:", error)
    }
  }

  const updateTale = async (updatedTale: Tale) => {
    try {
      const { getTales, saveTales } = await import("@/lib/store")
      const allTales = getTales()
      const index = allTales.findIndex((t) => t.id === updatedTale.id)
      if (index !== -1) {
        allTales[index] = updatedTale
        await saveTales(allTales)
        setTales(allTales)
        setEditingTale(null)
        window.dispatchEvent(new Event("tales-updated"))
      }
    } catch (error) {
      console.error("[v0] Error updating tale:", error)
    }
  }

  const deleteTale = async (taleId: string) => {
    try {
      const { getTales, saveTales, deleteTale: deleteTaleFromStore } = await import("@/lib/store")
      const allTales = getTales()
      const filtered = allTales.filter((t) => t.id !== taleId)
      await saveTales(filtered)
      await deleteTaleFromStore(taleId)
      setTales(filtered)
      window.dispatchEvent(new Event("tales-updated"))
    } catch (error) {
      console.error("[v0] Error deleting tale:", error)
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
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={saveChanges}
                disabled={isSaving}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload className="h-4 w-4" />
                {isSaving ? "Сохраняю..." : "Сохранить на GitHub"}
              </Button>
              <AddTaleDialog compact onSave={createTale} />
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
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
                  <CommentsManager taleId={tale.id} />
                  <EditTaleDialog
                    tale={tale}
                    onSave={updateTale}
                    onDelete={deleteTale}
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

function CommentsManager({ taleId }: { taleId: string }) {
  const [comments, setComments] = useState<import("@/lib/types").Comment[]>([])

  const loadComments = () => {
    import("@/lib/store").then(({ getComments }) => setComments(getComments(taleId)))
  }

  useEffect(() => {
    loadComments()
    window.addEventListener("comments-updated", loadComments)
    return () => window.removeEventListener("comments-updated", loadComments)
  }, [taleId])

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Удалить этот комментарий?")) return
    const { deleteComment } = await import("@/lib/store")
    await deleteComment(taleId, commentId)
    loadComments()
  }

  return (
    <div className="mb-4 rounded-md border p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <MessageCircle className="h-4 w-4" />
        Комментарии ({comments.length})
      </div>
      {comments.length === 0 ? (
        <p className="text-xs text-muted-foreground">Комментариев пока нет</p>
      ) : (
        <div className="flex flex-col gap-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start justify-between gap-2 rounded bg-muted/50 p-2 text-xs">
              <div className="min-w-0">
                <p className="font-medium">{comment.userName}</p>
                <p className="break-words text-muted-foreground">{comment.text}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(comment.id)}
                aria-label={`Удалить комментарий пользователя ${comment.userName}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddTaleDialog({ onSave, compact = false }: { onSave: (tale: Tale) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Tale>({
    id: "",
    title: "",
    summary: "",
    fullText: "",
    image: "",
    likes: 0,
    publishedDate: new Date().toISOString().slice(0, 10),
    readingTime: "5 min read",
  })

  const updateField = (field: keyof Tale, value: string | number) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSave = () => {
    if (!formData.title.trim() || !formData.fullText.trim()) return
    onSave({
      ...formData,
      id: `tale-${Date.now()}`,
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      fullText: formData.fullText.trim(),
    })
    setFormData({
      id: "",
      title: "",
      summary: "",
      fullText: "",
      image: "",
      likes: 0,
      publishedDate: new Date().toISOString().slice(0, 10),
      readingTime: "5 min read",
    })
    setOpen(false)
  }

  return (
    <div className={compact ? "flex" : "contents"}>
      <Card className={compact ? "border-0 shadow-none" : "border-dashed"}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant={compact ? "default" : "ghost"}
              className={compact ? "gap-2" : "h-full min-h-48 w-full flex-col gap-3"}
            >
              <Plus className={compact ? "size-4" : "size-8"} />
              <span>Добавить рассказ</span>
            </Button>
          </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новый рассказ</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="new-tale-title">Название</label>
              <Input id="new-tale-title" value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Название рассказа" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="new-tale-date">Дата публикации</label>
              <Input id="new-tale-date" type="date" value={formData.publishedDate} onChange={(e) => updateField("publishedDate", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="new-tale-reading-time">Время чтения</label>
              <Input id="new-tale-reading-time" value={formData.readingTime} onChange={(e) => updateField("readingTime", e.target.value)} placeholder="например: 5 min read" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="new-tale-summary">Аннотация</label>
              <Textarea id="new-tale-summary" value={formData.summary} onChange={(e) => updateField("summary", e.target.value)} placeholder="Краткое описание рассказа" rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="new-tale-content">Текст рассказа</label>
              <Textarea id="new-tale-content" value={formData.fullText} onChange={(e) => updateField("fullText", e.target.value)} placeholder="Полный текст рассказа" rows={12} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="new-tale-image">URL изображения</label>
              <Input id="new-tale-image" value={formData.image} onChange={(e) => updateField("image", e.target.value)} placeholder="/path/to/image.jpg или https://..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Отменить</Button>
            <Button onClick={handleSave} disabled={!formData.title.trim() || !formData.fullText.trim()}>Добавить рассказ</Button>
          </div>
        </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}

function EditTaleDialog({
  tale,
  onSave,
  onDelete,
}: {
  tale: Tale
  onSave: (tale: Tale) => void
  onDelete: (taleId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(tale)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync formData when tale changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData(tale)
    }
  }, [open, tale])

  const handleSave = () => {
    onSave(formData)
    setOpen(false)
  }

  const applyFormatting = (format: 'bold' | 'italic') => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    if (!selectedText) return

    let formattedText = selectedText
    if (format === 'bold') {
      formattedText = `**${selectedText}**`
    } else if (format === 'italic') {
      formattedText = `_${selectedText}_`
    }

    const newText = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end)
    handleFieldChange('fullText', newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault()
        applyFormatting('bold')
      } else if (e.key === 'i') {
        e.preventDefault()
        applyFormatting('italic')
      }
    }
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

  const handleDelete = () => {
    onDelete(tale.id)
    setOpen(false)
    setShowDeleteConfirm(false)
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Основное</TabsTrigger>
            <TabsTrigger value="content">Содержание</TabsTrigger>
            <TabsTrigger value="image">Изображение</TabsTrigger>
            <TabsTrigger value="comments">Комментарии</TabsTrigger>
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
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('bold')}
                  title="Жирный (Ctrl+B)"
                  className="gap-2"
                >
                  <Bold className="h-4 w-4" />
                  Жирный
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('italic')}
                  title="Курсив (Ctrl+I)"
                  className="gap-2"
                >
                  <Italic className="h-4 w-4" />
                  Курсив
                </Button>
                <div className="text-xs text-slate-500 flex items-center">
                  Используйте **текст** для жирного и _текст_ для курсива
                </div>
              </div>
              <Textarea
                ref={textareaRef}
                value={formData.fullText}
                onChange={(e) => handleFieldChange("fullText", e.target.value)}
                onKeyDown={handleKeyDown}
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

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            <CommentsManager taleId={tale.id} />
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-between mt-6">
          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить рассказ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие нельзя отменить. Рассказ "{tale.title}" будет удален
                  окончательно.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отменить</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Удалить
          </Button>

          <div className="flex gap-2">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
