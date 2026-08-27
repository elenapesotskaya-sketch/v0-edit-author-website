import { NextRequest, NextResponse } from "next/server"
import { saveStoriesToGitHub } from "@/lib/github-api"
import type { Tale, AuthorInfo } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tales, author } = body as { tales: Tale[]; author?: AuthorInfo }

    if (!Array.isArray(tales)) {
      return NextResponse.json(
        { success: false, message: "Invalid tales array" },
        { status: 400 }
      )
    }

    // Save to GitHub
    const result = await saveStoriesToGitHub(
      tales,
      author || {},
      `Update ${tales.length} stories`
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Changes saved successfully to GitHub",
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
