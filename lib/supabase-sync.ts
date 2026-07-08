import { createClient } from "@supabase/supabase-js"
import type { Tale, Comment, AuthorInfo } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Initialize database tables on first load
export async function initializeDatabase() {
  try {
    // Check if tables exist by trying to fetch data
    const { error: talesError } = await supabase
      .from("tales")
      .select("id")
      .limit(1)

    const { error: authorError } = await supabase
      .from("author_info")
      .select("id")
      .limit(1)

    // If tables don't exist, they'll be created on first write
    return { success: true, talesError, authorError }
  } catch (error) {
    console.error("[v0] Database initialization error:", error)
    return { success: false, error }
  }
}

// Author Info Operations
export async function getAuthorFromDB(): Promise<AuthorInfo | null> {
  try {
    const { data, error } = await supabase
      .from("author_info")
      .select("*")
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return data
      ? {
          name: data.name,
          bio: data.bio,
          image: data.image,
          tagline: data.tagline,
          genreDescription: data.genre_description,
        }
      : null
  } catch (error) {
    console.error("[v0] Error fetching author:", error)
    return null
  }
}

export async function saveAuthorToDB(author: AuthorInfo): Promise<boolean> {
  try {
    const { error } = await supabase.from("author_info").upsert([
      {
        id: 1,
        name: author.name,
        bio: author.bio,
        image: author.image,
        tagline: author.tagline,
        genre_description: author.genreDescription,
        updated_at: new Date().toISOString(),
      },
    ])

    if (error) throw error
    return true
  } catch (error) {
    console.error("[v0] Error saving author:", error)
    return false
  }
}

// Tales Operations
export async function getTalesFromDB(): Promise<Tale[]> {
  try {
    const { data, error } = await supabase
      .from("tales")
      .select("*")
      .order("published_date", { ascending: false })

    if (error) throw error

    return (
      data?.map((tale) => ({
        id: tale.id,
        title: tale.title,
        summary: tale.summary,
        fullText: tale.full_text,
        image: tale.image,
        likes: tale.likes || 0,
        publishedDate: tale.published_date,
        readingTime: tale.reading_time,
      })) || []
    )
  } catch (error) {
    console.error("[v0] Error fetching tales:", error)
    return []
  }
}

export async function getTaleFromDB(id: string): Promise<Tale | null> {
  try {
    const { data, error } = await supabase
      .from("tales")
      .select("*")
      .eq("id", id)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return data
      ? {
          id: data.id,
          title: data.title,
          summary: data.summary,
          fullText: data.full_text,
          image: data.image,
          likes: data.likes || 0,
          publishedDate: data.published_date,
          readingTime: data.reading_time,
        }
      : null
  } catch (error) {
    console.error("[v0] Error fetching tale:", error)
    return null
  }
}

export async function saveTaleToDB(tale: Tale): Promise<boolean> {
  try {
    const { error } = await supabase.from("tales").upsert([
      {
        id: tale.id,
        title: tale.title,
        summary: tale.summary,
        full_text: tale.fullText,
        image: tale.image,
        likes: tale.likes || 0,
        published_date: tale.publishedDate,
        reading_time: tale.readingTime,
        updated_at: new Date().toISOString(),
      },
    ])

    if (error) throw error
    return true
  } catch (error) {
    console.error("[v0] Error saving tale:", error)
    return false
  }
}

export async function saveTalesToDB(tales: Tale[]): Promise<boolean> {
  try {
    const talesData = tales.map((tale) => ({
      id: tale.id,
      title: tale.title,
      summary: tale.summary,
      full_text: tale.fullText,
      image: tale.image,
      likes: tale.likes || 0,
      published_date: tale.publishedDate,
      reading_time: tale.readingTime,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from("tales").upsert(talesData)

    if (error) throw error
    return true
  } catch (error) {
    console.error("[v0] Error saving tales:", error)
    return false
  }
}

export async function deleteTaleFromDB(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("tales").delete().eq("id", id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("[v0] Error deleting tale:", error)
    return false
  }
}

// Comments Operations
export async function getCommentsFromDB(taleId: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("tale_id", taleId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (
      data?.map((comment) => ({
        id: comment.id,
        taleId: comment.tale_id,
        userName: comment.user_name,
        text: comment.text,
        timestamp: comment.created_at,
      })) || []
    )
  } catch (error) {
    console.error("[v0] Error fetching comments:", error)
    return []
  }
}

export async function saveCommentToDB(comment: Comment): Promise<boolean> {
  try {
    const { error } = await supabase.from("comments").insert([
      {
        id: comment.id,
        tale_id: comment.taleId,
        user_name: comment.userName,
        text: comment.text,
        created_at: comment.timestamp,
      },
    ])

    if (error) throw error
    return true
  } catch (error) {
    console.error("[v0] Error saving comment:", error)
    return false
  }
}

// Likes Operations
export async function incrementLikeInDB(taleId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc("increment_likes", {
      tale_id: taleId,
    })

    if (error) throw error
    return data || 0
  } catch (error) {
    console.error("[v0] Error incrementing likes:", error)
    // Fallback: fetch current likes
    const tale = await getTaleFromDB(taleId)
    return tale?.likes || 0
  }
}

export async function getLikesFromDB(taleId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("tales")
      .select("likes")
      .eq("id", taleId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return data?.likes || 0
  } catch (error) {
    console.error("[v0] Error fetching likes:", error)
    return 0
  }
}

// Real-time subscription setup
export function subscribeToTalesChanges(
  callback: (payload: any) => void
) {
  const subscription = supabase
    .channel("tales_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tales",
      },
      callback
    )
    .subscribe()

  return subscription
}

export function subscribeToAuthorChanges(
  callback: (payload: any) => void
) {
  const subscription = supabase
    .channel("author_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "author_info",
      },
      callback
    )
    .subscribe()

  return subscription
}
