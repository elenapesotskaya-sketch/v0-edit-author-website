"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ArrowUpDown, Heart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthorLogin } from "@/components/author-login"
import { AuthorDashboard } from "@/components/author-dashboard"
import { getTales, getComments } from "@/lib/store"
import type { Tale } from "@/lib/types"

function formatStoryDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})/)
  if (!match) return value

  const [, year, month] = match
  const date = new Date(Number(year), Number(month) - 1, 1)
  const formatted = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date)

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export default function StoriesPage() {
  const [isAuthorLoggedIn, setIsAuthorLoggedIn] = useState(false)
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

  const filteredTales = tales.filter((tale) => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return true

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
    return null
  }

  if (isAuthorLoggedIn) {
    return <AuthorDashboard onLogout={() => setIsAuthorLoggedIn(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800">
      <AuthorLogin onLogin={() => setIsAuthorLoggedIn(true)} />

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
              name="story-search"
              placeholder="Search stories by title, summary, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoComplete="new-password"
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
  const [commentCount, setCommentCount] = useState(0)

  useEffect(() => {
    const updateCommentCount = () => setCommentCount(getComments(tale.id).length)
    updateCommentCount()
    window.addEventListener("comments-updated", updateCommentCount)
    return () => window.removeEventListener("comments-updated", updateCommentCount)
  }, [tale.id])

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
            <span>{formatStoryDate(tale.publishedDate)}</span>
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
              <span>{commentCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
