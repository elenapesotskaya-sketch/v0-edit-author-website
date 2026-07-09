import { NextRequest, NextResponse } from "next/server"
import { saveStoriesToGitHub } from "@/lib/github-api"
import type { Tale } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tales }: { tales: Tale[] } = body

    if (!Array.isArray(tales)) {
      return NextResponse.json(
        { success: false, message: "Invalid tales array" },
        { status: 400 }
      )
    }

    // Generate the TypeScript code for stories
    const storiesContent = generateStoryCode(tales)

    // Save to GitHub
    const result = await saveStoriesToGitHub(
      storiesContent,
      `Update ${tales.length} stories`
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Stories saved successfully to GitHub",
        commit: result.sha,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    )
  }
}

function generateStoryCode(tales: Tale[]): string {
  const talesJSON = JSON.stringify(tales, null, 2)
  return `import type { Tale } from "./types"

export const DEFAULT_TALES: Tale[] = ${talesJSON}
`
}
