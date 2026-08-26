"use client"

import type { Tale, Comment, AuthorInfo } from "./types"

const STORAGE_KEYS = {
  TALES: "author_tales",
  COMMENTS: "tale_comments",
  LIKES: "tale_likes",
  AUTHOR: "author_info",
}

// Cache for performance
let cachedTales: Tale[] | null = null
let cachedAuthor: AuthorInfo | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Default data
export const DEFAULT_AUTHOR: AuthorInfo = {
  name: "Konstantin Polunin",
  bio: "Константин — автор нового жанра «самолётных рассказов» — коротких историй, рождающихся в небе. Он пишет их во время перелётов, наблюдая за людьми, облаками и суетой между взлётом и посадкой.",
  image: "/author-portrait.png",
  tagline: "Author of Contemporary Short Stories",
  genreDescription:
    "Лёгкий, почти невесомый диалог, в котором бытовые сцены незаметно превращаются в философские петли, а каламбуры естественно сплетаются с идеями о технологиях. Настоящие путешествия в этих рассказах происходят в голове — между буквами, смыслами и вопросами, которые цепляются друг за друга и продолжают звучать тихим эхом, заставляя читателя ещё долго мысленно возвращаться к тому, что скрыто между строк.",
}

export const DEFAULT_TALES: Tale[] = [
  {
    id: "1",
    title: "The Lighthouse Keeper",
    summary: "A haunting story of solitude and connection on a remote island.",
    fullText: `The wind howled around the lighthouse as Margaret climbed the spiral stairs one more time. She had been the keeper here for three years now, and the rhythm of the waves had become her heartbeat.

One stormy evening, while organizing the storage room, she found an old leather journal wedged between two wooden crates. The pages were yellowed with age, the ink faded but still legible. It belonged to a keeper from 1847, a man named Thomas Wright.

As she read his entries, she discovered he had documented strange phenomena—lights beneath the waves, songs that seemed to come from nowhere, and a map leading to something he called "the heart of the ocean."

Margaret knew she shouldn't believe in fairy tales, but something in her soul stirred. Perhaps some mysteries were meant to be pursued, even if you never found the answers.

The next morning, she began her own journal, continuing where Thomas had left off, adding her observations to a story that spanned centuries.`,
    image: "/lighthouse-on-stormy-cliff.jpg",
    likes: 0,
    publishedDate: "2024-01-15",
    readingTime: "5 min read",
  },
  {
    id: "2",
    title: "Whispers in the Garden",
    summary: "A woman discovers that her family garden holds secrets from generations past.",
    fullText: `Rosa had tended the garden for forty years. Her hands were weathered, her back bent, but her spirit remained as vibrant as the flowers she grew.

The garden was no ordinary place. Each plant held a secret—not hers, but those of the people who passed by. The roses whispered of lost love, the ivy spoke of forgotten dreams, and the ancient oak tree shared the weight of unspoken regrets.

People came from far and wide, though few knew why they felt drawn to this particular garden. They would sit on the stone bench, surrounded by blooms, and somehow feel lighter when they left.

Rosa never told anyone about the magic. She simply listened to the whispers, tended to each plant with care, and trusted that the garden knew what each visitor needed to hear.

"Every truth needs time to bloom," she would say, pruning the honeysuckle. "And every secret, eventually, wants to be set free."`,
    image: "/magical-garden-with-colorful-flowers.jpg",
    likes: 0,
    publishedDate: "2024-02-20",
    readingTime: "4 min read",
  },
  {
    id: "3",
    title: "The Last Letter",
    summary: "An elderly postman delivers one final letter that changes everything.",
    fullText: `Henry had been a mailman for thirty-five years. He knew every street, every house, every dog that would bark at his approach. But he had never seen a letter quite like this one.

It had appeared in the sorting office with no explanation—a cream envelope, aged and delicate, addressed to "Margaret Holloway, 42 Maple Street." The postmark read 1974.

Margaret Holloway had been dead for twenty years, but her daughter still lived at that address. Henry stood on the porch, uncertain, the letter in his trembling hand.

When Sarah Holloway opened the door, Henry explained. She took the letter with tears in her eyes—it was from her father, written before he died in Vietnam, a letter that never made it home.

Inside were words of love, promises of return, and dreams of the life they would build together. Sarah had grown up believing her father never wrote, that perhaps he hadn't cared enough.

That evening, she called her own daughter, bridging another gap with words that had waited too long to be spoken.

"It's never too late for truth," Henry thought as he walked away, his delivery complete at last.`,
    image: "/vintage-letter-and-mailbox.jpg",
    likes: 0,
    publishedDate: "2024-03-10",
    readingTime: "6 min read",
  },
  {
    id: "4",
    title: "Midnight Train",
    summary: "A chance encounter on a late-night train reveals unexpected connections.",
    fullText: `The midnight train was nearly empty. Elena sat by the window, watching the city lights blur past, when an elderly man took the seat across from her.

He carried an old violin case, worn at the edges, covered in travel stickers from countries she'd only dreamed of visiting. Without a word, he opened it and began to play.

The melody was haunting—sad yet hopeful, familiar yet unknown. As the notes filled the car, Elena realized she'd heard this song before. Her grandmother used to hum it while cooking, claiming it was from her childhood in a village that no longer existed.

When the song ended, the old man smiled. "Your grandmother was Sofia, wasn't she?"

Elena's heart stopped. How could he possibly know?

"I knew her once," he continued softly. "Before the war. Before everything changed. She asked me to play this for you if I ever found you. She said you'd need it someday."

The train pulled into the next station, and the man stood to leave. "Some music," he said, "travels further than we do. It finds who it needs to find."

He disappeared into the night, leaving Elena with a melody and a mystery she'd spend years trying to understand.`,
    image: "/vintage-train-at-night.jpg",
    likes: 0,
    publishedDate: "2024-03-25",
    readingTime: "5 min read",
  },
  {
    id: "5",
    title: "The Bookshop at the End of the World",
    summary: "A mysterious bookshop appears only to those who need it most.",
    fullText: `The bookshop wasn't there yesterday. Marcus was certain of it. He'd walked this street every day for ten years, and the space between the bakery and the tailor had always been a blank wall.

Now, a door stood there, painted deep blue, with a brass handle shaped like an open book. The sign above read: "The Last Chapter."

Inside, the shop seemed impossibly large, with shelves stretching into shadows that had no business existing in such a small space. An old woman sat behind the counter, knitting.

"I've been expecting you," she said without looking up.

"I think there's been a mistake—"

"There never is. Everyone who finds this shop needs something they've lost. Usually, it's themselves." She gestured to the shelves. "Your book is waiting."

Marcus wandered through the aisles, and there, on a shelf at eye level, was a journal with his name on the cover. Inside were entries he'd never written—alternate versions of his life, roads not taken, conversations he'd avoided.

The last page was blank except for one line: "It's not too late to choose a different ending."

When he looked up, the old woman smiled. "Every story can be rewritten. You just have to be brave enough to turn the page."`,
    image: "/mysterious-old-bookshop.jpg",
    likes: 0,
    publishedDate: "2024-04-05",
    readingTime: "6 min read",
  },
  {
    id: "6",
    title: "Songs of the Deep",
    summary: "A marine biologist discovers that whales are not the only ones singing in the ocean.",
    fullText: `Dr. Amelia Chen had been studying whale songs for fifteen years, but what she heard on her hydrophone that morning defied explanation.

It wasn't the familiar calls of humpbacks or the clicks of sperm whales. This was something else—structured, complex, almost like language. And it was getting closer.

Her research vessel floated in the middle of the Pacific, miles from any land. The crew was asleep. She was alone with the sound that seemed to be calling directly to her.

Against every protocol, she dove into the dark water, following the song deeper than she'd ever gone. In the murky blue, shapes moved—not whales, but something ancient and aware.

They didn't speak in words, but she understood. They were the ocean's memory, the keepers of stories older than humanity. And they had a message: the sea was changing, and soon it would have to choose between remembering and forgetting.

When Amelia surfaced, hours had passed. Her crew found her floating, peaceful, with no memory of what happened below. But every night since, she dreams in song, and the ocean answers back.`,
    image: "/deep-ocean-underwater-scene.jpg",
    likes: 0,
    publishedDate: "2024-04-18",
    readingTime: "5 min read",
  },
  {
    id: "7",
    title: "The Clockmaker's Daughter",
    summary: "Time stops for a girl who can hear the heartbeat of every clock.",
    fullText: `In the clockmaker's shop, time moved differently. Every tick, every tock, was a heartbeat—a life counted down, a moment preserved.

Lily grew up among the gears and pendulums, learning her father's craft. But she had a gift he didn't: she could hear not just the clocks, but the time inside people. Everyone had their own rhythm, their own countdown.

One day, a man entered the shop carrying a broken pocket watch. When Lily touched it, she heard silence—no heartbeat, no time remaining.

"How long do I have?" he asked quietly.

She wanted to lie, to offer comfort, but the clocks never lied. "Three days."

He nodded as if he'd known. "Can you fix it? I want these last days to count."

Lily worked through the night, repairing not just the watch but somehow the time within it. When she finished, she heard his heartbeat again—faint but steady.

The man left with the watch, and Lily never saw him again. But sometimes she wonders: did she fix time, or did she simply teach him to hear his own?`,
    image: "/antique-clock-shop-interior.jpg",
    likes: 0,
    publishedDate: "2024-05-02",
    readingTime: "5 min read",
  },
  {
    id: "8",
    title: "The Memory Painter",
    summary: "An artist discovers she can paint not what she sees, but what others remember.",
    fullText: `Nina's paintings were different. People would look at them and cry, claiming they showed moments from their lives—childhood rooms, forgotten faces, lost summers.

She never understood how she did it. She simply painted what felt right, what the canvas asked for. But each piece seemed to belong to someone specific, waiting to be recognized.

One afternoon, an old man entered her gallery and stopped before a painting of a small café in Paris. His hands shook as he reached toward it.

"This is where I proposed," he whispered. "Sixty years ago. I'd forgotten the blue door, the flower boxes, the way the light fell through the window. How did you know?"

Nina had no answer. She'd never been to Paris. She'd painted the café from a dream, or so she thought.

The man bought the painting and left, and Nina realized her gift wasn't creation—it was restoration. She painted the memories people had lost, giving back pieces of their lives they thought were gone forever.

Now she paints not for galleries, but for those who've forgotten. And every canvas finds its way home.`,
    image: "/artist-studio-painting.png",
    likes: 0,
    publishedDate: "2024-05-20",
    readingTime: "4 min read",
  },
  {
    id: "9",
    title: "Footprints in Winter",
    summary: "A trail of mysterious footprints leads a hiker to an impossible discovery.",
    fullText: `The snow had fallen overnight, covering the mountain in pristine white. Maya set out at dawn, the first person on the trail—or so she thought.

Footprints appeared ahead of her. Fresh ones, heading up the mountain. But they were strange: too large to be human, too deliberate to be animal. And they only appeared in certain places, as if the walker knew which snow would hold their weight.

Curiosity drove her forward. The trail led off the path, through dense forest, to a clearing she'd never seen despite hiking this mountain for years.

In the center stood a cabin, impossibly old, covered in ice but somehow standing. The footprints led to the door and stopped.

Inside, she found journals from explorers who'd been lost for decades, their last entries describing this same cabin, these same impossible footprints. Each had followed the trail and disappeared.

Maya understood then: the mountain kept its secrets by sharing them only with those brave enough to follow. She added her own journal to the collection and stepped back into the snow.

The footprints appeared again, leading her home, and when she looked back, the cabin was gone.`,
    image: "/snowy-mountain-trail-winter.jpg",
    likes: 0,
    publishedDate: "2024-06-08",
    readingTime: "5 min read",
  },
  {
    id: "10",
    title: "The Night Market",
    summary: "A market that exists only between midnight and dawn sells more than ordinary goods.",
    fullText: `They say the Night Market appears when the city is truly asleep, when the last light goes dark and the streets hold their breath.

Jin found it by accident, following the scent of spices and the sound of distant music. Between two buildings that should have been empty, a narrow alley opened into a sprawling market lit by paper lanterns.

Vendors sold impossible things: bottled laughter, forgotten songs, the courage to speak truth. Some booths offered memories you never had; others, dreams yet to come.

An old woman beckoned him to her stall. "What are you looking for?"

"I don't know," Jin admitted.

"Good. Those who come seeking usually leave empty. But those who come wandering..." She handed him a small wooden box. "This is what you need."

Inside was a compass that pointed not north, but toward joy. Its needle spun wildly in the market, then settled firmly in one direction as Jin left.

He followed it home, then to work, then slowly toward choices he'd been too afraid to make. The compass eventually stopped spinning—not because it broke, but because he'd found what he'd been missing.

The Night Market never appeared to him again. He no longer needed it to.`,
    image: "/mystical-night-market-with-lanterns.jpg",
    likes: 0,
    publishedDate: "2024-06-25",
    readingTime: "5 min read",
  },
  {
    id: "11",
    title: "The Stargazer's Secret",
    summary: "An astronomer discovers constellations that exist only in certain hearts.",
    fullText: `Professor Ravi had mapped the stars for forty years, but the woman who walked into his observatory spoke of constellations he'd never seen.

"The Weaver, the Dreamer, the Lost Child," she said, pointing to what he saw as empty space. "They're not in the sky. They're in us. You can see them if you know how to look."

She taught him a different kind of observation—not through telescopes, but through understanding. Each person carried their own constellation, a pattern of experiences and connections unique as fingerprints.

His daughter, he realized, was the Dancer—graceful, moving through life with purpose. His ex-wife, the Storm—powerful, transformative, difficult to predict. And himself? The Lighthouse—fixed in place, casting light for others while never moving.

The woman vanished as mysteriously as she'd arrived, but Ravi never saw the night sky the same way again. Now he looked at people and saw the stars within them, the patterns that made them who they were.

"We're all made of stars," astronomers say. Ravi finally understood what that meant.`,
    image: "/telescope-observatory-starry-night.jpg",
    likes: 0,
    publishedDate: "2024-07-10",
    readingTime: "4 min read",
  },
  {
    id: "12",
    title: "The Bridge Between",
    summary: "A bridge appears only when two strangers need to find each other.",
    fullText: `The river had no bridge. Local legend said one appeared when it was needed, but Emma had never believed in legends.

Then came the night she stood at the water's edge, lost in every sense of the word. Her marriage had ended, her job was gone, and she'd driven aimlessly until the road ran out.

That's when she saw it: a wooden bridge stretching across the dark water, lit by lanterns that shouldn't exist. On the other side, a figure stood waiting.

She crossed, each step feeling like leaving something behind. The man on the other side was crying too.

"I didn't think anyone else could see it," he said.

They sat together on the bridge, two strangers sharing their stories until dawn. He'd lost his daughter. She'd lost herself. Neither had anyone to talk to, anyone who would understand.

When morning came, the bridge was gone. But they exchanged numbers, promised to meet again. Sometimes the bridges we need aren't made of wood and stone—they're made of shared pain and the courage to cross anyway.

Emma still visits that spot by the river. The bridge hasn't appeared again, but she's no longer looking for it.`,
    image: "/misty-wooden-bridge-over-river.jpg",
    likes: 0,
    publishedDate: "2024-07-28",
    readingTime: "5 min read",
  },
  {
    id: "13",
    title: "The Language of Rain",
    summary: "A linguist discovers that rain carries messages in a language older than words.",
    fullText: `Dr. Isabel Morrow studied dead languages, but the rain taught her one that had never died.

It started during a storm in Bangkok. She was reviewing ancient texts when the rhythm of rain on the window seemed to match the patterns in the manuscript. Not randomly—perfectly.

She began recording rainstorms around the world: monsoons in India, spring showers in Paris, summer thunder in New York. Each had a distinct pattern, and together they formed something extraordinary: a language.

Rain spoke of the earth's moods, the sky's memories, the conversations between land and cloud. It told stories of droughts and floods, of civilizations that listened and those that didn't.

Isabel published her findings, but the academic world dismissed her. "Rain is random," they said. "You're seeing patterns that don't exist."

But farmers in remote villages understood. Indigenous elders nodded in recognition. Children heard it instinctively. The language wasn't lost—people had simply stopped listening.

Now Isabel teaches a different kind of linguistics. She stands in the rain with her students and says, "Be quiet. Listen. The earth is trying to tell us something important."

And slowly, carefully, they learn to hear.`,
    image: "/rain-falling-on-window-artistic.jpg",
    likes: 0,
    publishedDate: "2024-08-15",
    readingTime: "5 min read",
  },
  {
    id: "14",
    title: "The Forgotten Orchestra",
    summary: "An abandoned concert hall plays music only certain souls can hear.",
    fullText: `The concert hall had been empty for thirty years, but Thomas could hear music coming from inside.

He was supposed to be demolishing the building tomorrow. Tonight was his last chance to see it intact. The doors were locked, but one window had broken long ago.

Inside, dust covered everything—seats, stage, chandelier. But he heard it clearly: an orchestra playing something beautiful and sad, a piece that made his chest ache with longing.

As he walked down the aisle, he saw them: translucent figures with instruments, playing with desperate passion. They were musicians who'd died before their final performance, bound to the hall until someone heard their last song.

Thomas sat in the front row and listened. He'd been a musician once, before life got in the way, before bills and responsibilities silenced his violin. The ghostly orchestra played not for glory, but for love of music itself.

When the concert ended, the figures looked at him, smiled, and faded. The hall fell silent for the first time in decades.

The next day, Thomas didn't demolish the building. He restored it. And now, every week, he plays his violin on that stage, honoring those who never stopped making music—even after death.`,
    image: "/abandoned-elegant-concert-hall.jpg",
    likes: 0,
    publishedDate: "2024-09-01",
    readingTime: "5 min read",
  },
  {
    id: "15",
    title: "The Mirror City",
    summary: "Every city has a mirror version where all the choices not taken still exist.",
    fullText: `Sophia discovered the mirror city by accident—stepping through a puddle that reflected not sky, but an alternate version of her street.

Everything was familiar yet different. The coffee shop she'd never entered was her favorite place. The job she'd turned down had become her career. The person she'd almost dated was now her partner.

It was the life she could have lived, existing parallel to her own. And she could visit, but only briefly, before the reflection pulled her back.

She went often at first, comparing lives, wondering if she'd made the right choices. The mirror Sophia seemed happier, more confident, more successful. But as she watched closer, she saw the cracks.

Mirror Sophia had different regrets, different fears. She looked at puddles too, wondering about the life she hadn't chosen, not knowing the real Sophia was watching.

One day, their eyes met across the reflection. They both understood: there was no right choice, only different paths. Every decision created a mirror city, and somewhere, all versions of yourself were living their own stories.

Sophia stopped visiting after that. She had her own story to live, her own choices to make. Let the mirrors hold what might have been—she would embrace what was.`,
    image: "/city-reflected-in-puddle-surreal.jpg",
    likes: 0,
    publishedDate: "2024-09-20",
    readingTime: "6 min read",
  },
]

// Get functions
export async function getAuthorInfo(): Promise<AuthorInfo> {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTHOR)
    if (stored) {
      const author = JSON.parse(stored)
      cachedAuthor = author
      return author
    }
  }
  
  cachedAuthor = DEFAULT_AUTHOR
  return DEFAULT_AUTHOR
}

export function getTales(): Tale[] {
  return cachedTales ?? DEFAULT_TALES
}

export async function fetchTalesFromDB(): Promise<Tale[]> {
  const fallback = cachedTales ?? DEFAULT_TALES

  try {
    const response = await fetch("/api/stories", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })

    // A database/API failure must never reject the public reader. Keep the
    // bundled catalogue available while the API recovers.
    if (!response.ok) {
      console.warn(`[v0] Stories API returned ${response.status}; using fallback`)
      cachedTales = fallback
      return fallback
    }

    const data: unknown = await response.json()
    const tales = Array.isArray(data) ? data.map(fromDbTale).filter(Boolean) : []
    cachedTales = tales.length > 0 ? tales : fallback
    cacheTimestamp = Date.now()
    return cachedTales
  } catch (error) {
    console.warn("[v0] Story load unavailable; using bundled stories", error)
    cachedTales = fallback
    return fallback
  }
}

export function getTale(id: string): Tale | undefined {
  return getTales().find((tale) => tale.id === id)
}

export async function getTaleFromDBById(id: string): Promise<Tale | undefined> {
 const tales = await fetchTalesFromDB()
 return tales.find((tale) => tale.id === id)
 }

function fromDbTale(row: any): Tale {
  return { id: row.id, title: row.title, summary: row.summary, fullText: row.full_text, image: row.image, likes: row.likes ?? 0, publishedDate: row.published_date, readingTime: row.reading_time }
}

function toDbTale(tale: Tale) {
  return { id: tale.id, title: tale.title, summary: tale.summary, full_text: tale.fullText, image: tale.image, likes: tale.likes, published_date: tale.publishedDate, reading_time: tale.readingTime, updated_at: new Date().toISOString() }
}

export function getComments(taleId: string): Comment[] {
  const key = `${STORAGE_KEYS.COMMENTS}_${taleId}`
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  }
  return []
}

export async function fetchCommentsFromDB(taleId: string): Promise<Comment[]> {
  try {
    const comments = await getCommentsFromDB(taleId)
    const key = `${STORAGE_KEYS.COMMENTS}_${taleId}`
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(comments))
    }
    return comments
  } catch (error) {
    console.error("[v0] Error fetching comments from DB:", error)
    return getComments(taleId)
  }
}

export function getLikes(taleId: string): number {
  const key = `${STORAGE_KEYS.LIKES}_${taleId}`
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key)
    if (stored) {
      return parseInt(stored)
    }
  }
  
  // Try to get from tales cache
  const tale = getTale(taleId)
  return tale?.likes || 0
}

export async function fetchLikesFromDB(taleId: string): Promise<number> {
  try {
    const likes = await getLikesFromDB(taleId)
    const key = `${STORAGE_KEYS.LIKES}_${taleId}`
    if (typeof window !== "undefined") {
      localStorage.setItem(key, String(likes))
    }
    return likes
  } catch (error) {
    console.error("[v0] Error fetching likes from DB:", error)
    return getLikes(taleId)
  }
}

// Save functions
export async function saveAuthorInfo(author: AuthorInfo): Promise<void> {
  cachedAuthor = author
  cacheTimestamp = Date.now()
  
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.AUTHOR, JSON.stringify(author))
  }
  
  window.dispatchEvent(new Event("author-updated"))
}

export async function saveTales(tales: Tale[]): Promise<void> {
  const { supabase } = await import("@/lib/supabase")
  const { error } = await supabase.from("stories").upsert(tales.map(toDbTale), { onConflict: "id" })
  if (error) throw error
  cachedTales = tales
  cacheTimestamp = Date.now()
  if (typeof window !== "undefined") window.dispatchEvent(new Event("tales-updated"))
}

export async function saveTale(tale: Tale): Promise<void> {
  const response = await fetch("/api/stories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tale) })
  if (!response.ok) throw new Error("Unable to save story")
  cachedTales = [...getTales().filter((item) => item.id !== tale.id), tale]
  if (typeof window !== "undefined") window.dispatchEvent(new Event("tales-updated"))
}

export async function deleteTale(id: string): Promise<void> {
  const response = await fetch("/api/stories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
  if (!response.ok) throw new Error("Unable to delete story")
  cachedTales = getTales().filter((tale) => tale.id !== id)
  if (typeof window !== "undefined") window.dispatchEvent(new Event("tales-updated"))
}

export async function addComment(comment: Comment): Promise<void> {
  const key = `${STORAGE_KEYS.COMMENTS}_${comment.taleId}`
  const comments = getComments(comment.taleId)
  comments.push(comment)
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(comments))
  }
  
  window.dispatchEvent(new Event("comments-updated"))
}

export async function toggleLike(taleId: string, hasLiked: boolean): Promise<number> {
  const tale = getTale(taleId)
  if (!tale) return 0

  const newLikes = hasLiked ? Math.max(0, tale.likes - 1) : tale.likes + 1
  tale.likes = newLikes

  const tales = getTales()
  const index = tales.findIndex((t) => t.id === taleId)
  if (index !== -1) {
    tales[index].likes = newLikes
    await saveTales(tales)
  }

  const key = `${STORAGE_KEYS.LIKES}_${taleId}`
  if (typeof window !== "undefined") {
    localStorage.setItem(key, String(newLikes))
  }



  window.dispatchEvent(new Event("likes-updated"))

  return newLikes
}
