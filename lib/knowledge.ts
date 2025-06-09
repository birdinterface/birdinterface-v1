import { promises as fs } from "fs"
import path from "path"

// Cache for sections
const sectionCache = new Map<string, Map<string, string>>()

interface Section {
  title: string
  content: string
  keywords: string[]
}

async function parseKnowledgeBase(): Promise<Section[]> {
  const knowledgeBasePath = path.join(
    process.cwd(),
    "data",
    "knowledgeAdvancers"
  )
  const content = await fs.readFile(knowledgeBasePath, "utf8")

  const sections: Section[] = []
  let currentSection: Section | null = null

  const lines = content.split("\n")
  for (const line of lines) {
    if (line.match(/^\d+\.\d+\)/)) {
      // Matches patterns like "1.1)", "2.3)", etc.
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        title: line.trim(),
        content: "",
        keywords: line
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(Boolean),
      }
    } else if (currentSection) {
      currentSection.content += line + "\n"
      // Add important keywords from the content
      const words = line
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
      currentSection.keywords.push(...words)
    }
  }

  if (currentSection) {
    sections.push(currentSection)
  }

  return sections
}

export async function getRelevantKnowledge(
  userId: string,
  query: string
): Promise<string> {
  // Initialize user's section cache if it doesn't exist
  if (!sectionCache.has(userId)) {
    sectionCache.set(userId, new Map())

    // Parse and cache sections for this user
    const sections = await parseKnowledgeBase()
    const userCache = sectionCache.get(userId)!

    for (const section of sections) {
      userCache.set(section.title, JSON.stringify(section))
    }
  }

  const userCache = sectionCache.get(userId)!
  const queryWords = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

  // Find most relevant sections
  const relevantSections: Array<{ section: Section; relevance: number }> = []

  for (const sectionJson of userCache.values()) {
    const section: Section = JSON.parse(sectionJson)
    const matchingKeywords = queryWords.filter((word) =>
      section.keywords.includes(word)
    ).length

    if (matchingKeywords > 0) {
      relevantSections.push({
        section,
        relevance: matchingKeywords,
      })
    }
  }

  // Sort by relevance and take top 2 most relevant sections
  const topSections = relevantSections
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 2)
    .map((item) => item.section.content)
    .join("\n\n")

  return topSections || "No relevant knowledge found."
}
