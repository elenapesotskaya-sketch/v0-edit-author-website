import { NextResponse } from "next/server"
import postgres from "postgres"

function getDatabase() {
  const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL
  if (!connectionString) {
    throw new Error("Database connection is not configured")
  }

  return postgres(connectionString, {
    prepare: false,
    max: 1,
  })
}

export async function GET() {
  try {
    const sql = getDatabase()
    const stories = await sql`
      select id, title, summary, full_text, image, likes, published_date, reading_time
      from public.stories
      order by published_date desc, created_at desc
    `
    return NextResponse.json(stories)
  } catch (error) {
    console.error("[v0] Story load failed", error)
    return NextResponse.json({ error: "Unable to load stories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const sql = getDatabase()
    const body = await request.json()
    const id = String(body.id ?? "").trim()
    const title = String(body.title ?? "").trim()
    const summary = String(body.summary ?? "").trim()
    const fullText = String(body.fullText ?? "").trim()
    const publishedDate = String(body.publishedDate ?? "").trim()

    if (!id || !title || !summary || !fullText || !publishedDate) {
      return NextResponse.json({ error: "Story fields are incomplete" }, { status: 400 })
    }

    const [story] = await sql`
      insert into public.stories (id, title, summary, full_text, image, likes, published_date, reading_time, updated_at)
      values (${id}, ${title}, ${summary}, ${fullText}, ${String(body.image ?? "")}, ${Number(body.likes ?? 0)}, ${publishedDate}, ${String(body.readingTime ?? "5 min read")}, now())
      on conflict (id) do update set
        title = excluded.title,
        summary = excluded.summary,
        full_text = excluded.full_text,
        image = excluded.image,
        published_date = excluded.published_date,
        reading_time = excluded.reading_time,
        updated_at = now()
      returning id, title, summary, full_text, image, likes, published_date, reading_time, created_at, updated_at
    `

    return NextResponse.json(story)
  } catch (error) {
    console.error("[v0] Story save failed", error)
    return NextResponse.json({ error: "Unable to save story" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const sql = getDatabase()
    const { id } = await request.json()
    await sql`delete from public.stories where id = ${String(id ?? "")}`
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Story delete failed", error)
    return NextResponse.json({ error: "Unable to delete story" }, { status: 500 })
  }
}
