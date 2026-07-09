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
  content: string,
  message: string = "Update stories data"
): Promise<GitHubResponse> {
  if (!GITHUB_TOKEN) {
    return {
      success: false,
      message: "GITHUB_TOKEN not configured in environment variables",
    }
  }

  try {
    // Get current file SHA
    const getShaResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/stories.json?ref=${GITHUB_BRANCH}`,
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
    }

    // Encode content to base64
    const encodedContent = Buffer.from(content).toString("base64")

    // Update file
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/stories.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `${message} - Auto-save from admin panel`,
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
      message: "Stories saved to GitHub successfully",
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
