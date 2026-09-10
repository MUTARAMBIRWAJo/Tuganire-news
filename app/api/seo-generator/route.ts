import { NextResponse } from "next/server"

export const runtime = "edge"

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"

const buildFallbackSeo = ({ title, content, excerpt }: { title: string; content?: string; excerpt?: string }) => {
  const text = `${title} ${content || excerpt || ""}`
  const keywords = Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3 && !["this", "that", "with", "from", "into", "your", "have", "will", "what", "when", "they", "them", "been", "about", "news", "story"].includes(word))
    )
  ).slice(0, 8)

  const seoDescription = (excerpt || content || title || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155)

  return {
    seoTitle: title.length > 60 ? `${title.slice(0, 57).trim()}...` : title,
    seoDescription: seoDescription || `${title} — latest local and regional coverage.`,
    keywords,
  }
}

export async function POST(req: Request) {
  try {
    const { title, content, excerpt } = (await req.json()) as { title?: string; content?: string; excerpt?: string }
    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 })
    }

    const fallback = buildFallbackSeo({ title, content, excerpt })
    const openAiKey = process.env.OPENAI_API_KEY?.trim()

    if (!openAiKey) {
      return NextResponse.json(fallback)
    }

    const contentPreview = content.slice(0, 8000)
    const excerptText = excerpt ? `\nExcerpt: ${excerpt}` : ""
    const prompt = `Generate SEO metadata for this news article. Return strict JSON with keys seoTitle, seoDescription, keywords (5-10 items array).\nTitle: ${title}${excerptText}\nContent: ${contentPreview}`

    const llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You are an SEO assistant. Respond ONLY with valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    })

    if (!llmRes.ok) {
      return NextResponse.json(fallback)
    }

    const data = await llmRes.json()
    const contentText: string = data.choices?.[0]?.message?.content || ""

    try {
      const parsed = JSON.parse(contentText)
      if (parsed && typeof parsed === "object") {
        return NextResponse.json({
          seoTitle: parsed.seoTitle || fallback.seoTitle,
          seoDescription: parsed.seoDescription || fallback.seoDescription,
          keywords: Array.isArray(parsed.keywords) && parsed.keywords.length ? parsed.keywords.slice(0, 10) : fallback.keywords,
        })
      }
    } catch {
      // Fall back to a local heuristic if the model response is not valid JSON.
    }

    return NextResponse.json(fallback)
  } catch (e: any) {
    return NextResponse.json(buildFallbackSeo({ title: "Article", content: "" }), { status: 200 })
  }
}
