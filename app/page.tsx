"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, MessageCircle } from "lucide-react"
import { EditModeToggle } from "@/components/edit-mode-toggle"
import { EditableText } from "@/components/editable-text"
import { EditableImage } from "@/components/editable-image"
import { DataExportPanel } from "@/components/data-export-panel" // Added export panel
import { useEditMode } from "@/contexts/edit-mode-context"
import type { Tale } from "@/lib/types"

export default function HomePage() {
  const { isEditMode } = useEditMode()
  const [author, setAuthor] = useState({
    name: "Katherine Peterson",
    tagline: "Weaver of Words, Keeper of Stories",
    bio: "Katherine Peterson is an acclaimed author whose enchanting tales transport readers to worlds of wonder and imagination.",
    genreDescription:
      "Лёгкий, почти невесомый диалог, в котором бытовые сцены незаметно превращаются в философские петли, а каламбуры естественно сплетаются с идеями о технологиях. Настоящие путешествия в этих рассказах происходят в голове — между буквами, смыслами и вопросами, которые цепляются друг за друга и продолжают звучать тихим эхом, заставляя читателя ещё долго мысленно возвращаться к тому, что скрыто между строк.",
    image: "/professional-author-portrait.png",
  })
  const [tales, setTales] = useState<Tale[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const loadData = async () => {
      try {
        // Dynamic import to avoid bundling issues
        const { getAuthorInfo, getTales } = await import("@/lib/store")
        const authorData = getAuthorInfo()
        setAuthor(authorData)
        const allTales = getTales()
        setTales(allTales.slice(0, 3))
      } catch (error) {
        console.error("[v0] Error loading data:", error)
      }
    }

    loadData()

    const handleUpdate = () => loadData()

    window.addEventListener("author-updated", handleUpdate)
    window.addEventListener("tales-updated", handleUpdate)
    window.addEventListener("likes-updated", handleUpdate)

    return () => {
      window.removeEventListener("author-updated", handleUpdate)
      window.removeEventListener("tales-updated", handleUpdate)
      window.removeEventListener("likes-updated", handleUpdate)
    }
  }, [])

  const updateAuthor = async (field: string, value: string) => {
    const updated = { ...author, [field]: value }
    setAuthor(updated)
    const { saveAuthorInfo } = await import("@/lib/store")
    saveAuthorInfo(updated)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800">
      <EditModeToggle />
      {isEditMode && <DataExportPanel />}

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              HOME
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/stories"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Stories
              </Link>
              <Link
                href="/"
                className="text-slate-900 dark:text-slate-100 font-medium border-b-2 border-slate-900 dark:border-slate-100 pb-1"
              >
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-4">
              <EditableText
                value={author.name}
                onChange={(value) => updateAuthor("name", value)}
                className="font-serif font-bold"
              />
            </h1>
            <p className="text-xl text-amber-700 dark:text-amber-400 mb-6 italic">
              <EditableText
                value={author.tagline}
                onChange={(value) => updateAuthor("tagline", value)}
                className="italic"
              />
            </p>
            <div className="prose prose-lg dark:prose-invert text-balance">
              <EditableText
                value={author.bio}
                onChange={(value) => updateAuthor("bio", value)}
                multiline
                className="text-slate-700 dark:text-slate-300"
              />
            </div>
            <div className="mt-8">
              <Link href="/stories">
                <Button size="lg" className="gap-2">
                  Ко всем рассказам
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <EditableImage
              src={author.image}
              alt={author.name}
              onChange={(value) => updateAuthor("image", value)}
              className="rounded-2xl shadow-2xl"
              aspectRatio="aspect-square"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white dark:bg-slate-800/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-6">Самолетные рассказы</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <EditableText
              value={author.genreDescription}
              onChange={(value) => updateAuthor("genreDescription", value)}
              multiline
              className="text-slate-700 dark:text-slate-300 leading-relaxed text-pretty"
            />
          </div>
        </div>
      </section>

      {/* Featured Tales Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">Featured Stories</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {tales.map((tale) => (
            <TaleCard key={tale.id} tale={tale} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/stories">
            <Button variant="outline" size="lg">
              View All Stories
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600 dark:text-slate-400">
          <p>© 2025 {author.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function TaleCard({ tale }: { tale: Tale }) {
  return (
    <Link href={`/tales/${tale.id}`}>
      <Card className="group hover:shadow-xl transition-shadow cursor-pointer overflow-hidden h-full">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={tale.image || "/placeholder.svg"}
            alt={tale.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardHeader>
          <CardTitle className="font-serif text-2xl line-clamp-2">{tale.title}</CardTitle>
          <CardDescription className="flex items-center gap-4 text-xs">
            <span>{tale.publishedDate}</span>
            <span>•</span>
            <span>{tale.readingTime}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">{tale.summary}</p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{tale.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>Comments</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
