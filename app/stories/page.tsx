"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ArrowUpDown, Heart, MessageCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditModeToggle } from "@/components/edit-mode-toggle"
import { DataExportPanel } from "@/components/data-export-panel"
import { useEditMode } from "@/contexts/edit-mode-context"
import { getTales, saveTales } from "@/lib/store"
import type { Tale } from "@/lib/types"

export default function StoriesPage() {
  const { isEditMode } = useEditMode()
  const [tales, setTales] = useState<Tale[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "title" | "likes">("date")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTales(getTales())

    const handleUpdate = () => {
      setTales(getTales())
    }

    window.addEventListener("tales-updated", handleUpdate)
    window.addEventListener("likes-updated", handleUpdate)

    return () => {
      window.removeEventListener("tales-updated", handleUpdate)
      window.removeEventListener("likes-updated", handleUpdate)
    }
  }, [])

  const addNewTale = () => {
    const newTale: Tale = {
      id: Date.now().toString(),
      title: "New Tale",
      summary: "Click to edit summary...",
      fullText: "Write your story here...",
      image: "/story-illustration.jpg",
      likes: 0,
      publishedDate: new Date().toISOString().split("T")[0],
      readingTime: "5 min read",
    }
    const updated = [...tales, newTale]
    setTales(updated)
    saveTales(updated)
  }

  const filteredTales = tales.filter((tale) => {
    const query = searchQuery.toLowerCase()
    return (
      tale.title.toLowerCase().includes(query) ||
      tale.summary.toLowerCase().includes(query) ||
      tale.fullText.toLowerCase().includes(query)
    )
  })

  const sortedTales = [...filteredTales].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title)
      case "likes":
        return b.likes - a.likes
      case "date":
      default:
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    }
  })

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800">
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
                KP
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/stories"
                  className="text-slate-900 dark:text-slate-100 font-medium border-b-2 border-slate-900 dark:border-slate-100 pb-1"
                >
                  Stories
                </Link>
                <Link
                  href="/"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Home
                </Link>
              </nav>
            </div>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800">
      <EditModeToggle />
      {isEditMode && <DataExportPanel />}

      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              KP
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/stories"
                className="text-slate-900 dark:text-slate-100 font-medium border-b-2 border-slate-900 dark:border-slate-100 pb-1"
              >
                Stories
              </Link>
              <Link
                href="/"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">All Stories</h1>
          <p className="text-slate-600 dark:text-slate-400">Explore the complete collection of tales and narratives</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search stories by title, summary, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="title">Sort by Title</SelectItem>
                <SelectItem value="likes">Sort by Likes</SelectItem>
              </SelectContent>
            </Select>
            {isEditMode && (
              <Button onClick={addNewTale} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Story
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Showing {sortedTales.length} of {tales.length} {tales.length === 1 ? "story" : "stories"}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedTales.map((tale) => (
            <TaleCard key={tale.id} tale={tale} />
          ))}
        </div>

        {sortedTales.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg mb-2">No stories found</p>
            <p className="text-slate-400 text-sm">Try adjusting your search query</p>
          </div>
        )}
      </div>
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
