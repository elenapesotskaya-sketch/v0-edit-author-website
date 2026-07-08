"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Heart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AuthorLogin } from "@/components/author-login"
import { AuthorDashboard } from "@/components/author-dashboard"
import { getTale, getComments, addComment, getLikes, toggleLike } from "@/lib/store"
import type { Tale, Comment } from "@/lib/types"
export default function TalePage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const router = useRouter()
  const [isAuthorLoggedIn, setIsAuthorLoggedIn] = useState(false)
  const [tale, setTale] = useState<Tale | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [likes, setLikes] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Load saved user name
    const savedName = localStorage.getItem("user_name")
    if (savedName) setUserName(savedName)
  }, [])

  useEffect(() => {
    const loadedTale = getTale(id)
    if (loadedTale) {
      setTale(loadedTale)
      setComments(getComments(id))
      setLikes(getLikes(id))

      // Check if user has liked this tale
      const likedTales = JSON.parse(localStorage.getItem("user_liked_tales") || "[]")
      setHasLiked(likedTales.includes(id))
    }

    const handleUpdate = () => {
      const updated = getTale(id)
      if (updated) {
        setTale(updated)
        setComments(getComments(id))
        setLikes(getLikes(id))
      }
    }

    window.addEventListener("tales-updated", handleUpdate)
    window.addEventListener("comments-updated", handleUpdate)
    window.addEventListener("likes-updated", handleUpdate)

    return () => {
      window.removeEventListener("tales-updated", handleUpdate)
      window.removeEventListener("comments-updated", handleUpdate)
      window.removeEventListener("likes-updated", handleUpdate)
    }
  }, [id])

  if (isAuthorLoggedIn) {
    return <AuthorDashboard onLogout={() => setIsAuthorLoggedIn(false)} />
  }

  if (!tale) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-slate-600">Tale not found</p>
      </div>
    )
  }

  const handleLike = () => {
    const newLikes = toggleLike(id, hasLiked)
    setLikes(newLikes)
    setHasLiked(!hasLiked)

    // Save user's like state
    const likedTales = JSON.parse(localStorage.getItem("user_liked_tales") || "[]")
    if (hasLiked) {
      const filtered = likedTales.filter((taleId: string) => taleId !== id)
      localStorage.setItem("user_liked_tales", JSON.stringify(filtered))
    } else {
      likedTales.push(id)
      localStorage.setItem("user_liked_tales", JSON.stringify(likedTales))
    }
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !userName.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      taleId: id,
      userName: userName.trim(),
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    }

    // Save user name for future comments
    localStorage.setItem("user_name", userName.trim())

    addComment(comment)
    setComments([...comments, comment])
    setNewComment("")
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
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link href="/stories">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Stories
          </Button>
        </Link>

        {/* Title and Meta */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-4">
            {tale.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 mb-6">
            <div className="text-sm">{tale.publishedDate}</div>
            <div className="text-sm">•</div>
            <div className="text-sm">{tale.readingTime}</div>
          </div>

          <p className="text-xl text-slate-700 dark:text-slate-300 italic mb-6">
            {tale.summary}
          </p>
        </header>

        {/* Featured Image */}
        <img
          src={tale.image}
          alt={tale.title}
          className="mb-12 rounded-xl shadow-2xl w-full h-auto"
        />

        {/* Story Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
            {tale.fullText}
          </p>
        </div>

        <Separator className="my-8" />

        {/* Likes and Share */}
        <div className="flex items-center gap-4 mb-12">
          <Button variant={hasLiked ? "default" : "outline"} onClick={handleLike} className="gap-2">
            <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
            {likes} {likes === 1 ? "Like" : "Likes"}
          </Button>
        </div>

        {/* Comments Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Comments ({comments.length})
          </h2>

          {/* Add Comment */}
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold">Leave a Comment</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-background"
              />
              <textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg min-h-[100px] bg-background"
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim() || !userName.trim()}>
                Post Comment
              </Button>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{comment.userName}</h4>
                      <time className="text-sm text-slate-500">
                        {new Date(comment.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{comment.text}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </article>
    </div>
  )
}
