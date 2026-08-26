import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdmin() {
  return createClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, error } = await getAdmin().from("stories").upsert({ id: body.id, title: body.title, summary: body.summary, full_text: body.fullText, image: body.image ?? "", likes: Number(body.likes ?? 0), published_date: body.publishedDate, reading_time: body.readingTime ?? "5 min read", updated_at: new Date().toISOString() }, { onConflict: "id" }).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Story save failed", error)
    return NextResponse.json({ error: "Unable to save story" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    const { error } = await getAdmin().from("stories").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Story delete failed", error)
    return NextResponse.json({ error: "Unable to delete story" }, { status: 500 })
  }
}
