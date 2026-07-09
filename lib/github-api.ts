const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER || "elenapesotskaya-sketch"
const GITHUB_REPO = process.env.GITHUB_REPO || "v0-edit-author-website"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "v0/epesotskaya-6418-fa154c7d"

interface GitHubResponse {
  success: boolean
  message: string
  sha?: string
}

export async function saveStoriesToGitHub(
  stories: any,
  authorInfo: any,
  message: string = "Update stories from admin panel"
): Promise<GitHubResponse> {
  if (!GITHUB_TOKEN) {
    return {
      success: false,
      message: "GITHUB_TOKEN not configured in environment variables",
    }
  }

  try {
    // Generate TypeScript code for lib/store.ts
    const fileContent = `import type { Tale, AuthorInfo } from "./types"

export const DEFAULT_AUTHOR: AuthorInfo = ${JSON.stringify(authorInfo, null, 2)}

export const DEFAULT_TALES: Tale[] = ${JSON.stringify(stories, null, 2)}
`

    // Get current file SHA
    const getShaResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/lib/store.ts?ref=${GITHUB_BRANCH}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    )

    let sha: string | undefined
    if (getShaResponse.ok) {
      const data = await getShaResponse.json()
      sha = data.sha
    } else if (getShaResponse.status !== 404) {
      const error = await getShaResponse.json()
      console.error("[v0] GitHub API error (get SHA):", error)
      return {
        success: false,
        message: `GitHub API error: ${error.message || "Unknown error"}`,
      }
    }

    // Encode content to base64
    const encodedContent = Buffer.from(fileContent).toString("base64")

    // Update file
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/lib/store.ts`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `${message} - ${new Date().toLocaleString()}`,
          content: encodedContent,
          branch: GITHUB_BRANCH,
          ...(sha && { sha }),
        }),
      }
    )

    if (!updateResponse.ok) {
      const error = await updateResponse.json()
      console.error("[v0] GitHub API error:", error)
      return {
        success: false,
        message: `GitHub API error: ${error.message || "Unknown error"}`,
      }
    }

    const result = await updateResponse.json()
    return {
      success: true,
      message: "Changes committed to GitHub successfully",
      sha: result.commit.sha,
    }
  } catch (error) {
    console.error("[v0] Error saving to GitHub:", error)
    return {
      success: false,
      message: `Error saving to GitHub: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
