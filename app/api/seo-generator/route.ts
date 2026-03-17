import { NextResponse } from "next/server"

export const runtime = "edge"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"

export async function POST(req: Request) {
  try {
    const { title, content, excerpt } = (await req.json()) as { title?: string; content?: string; excerpt?: string }
    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 })
    }

    const contentPreview = content.slice(0, 8000)
    const excerptText = excerpt ? `\nExcerpt: ${excerpt}` : ""
    const prompt = `Generate SEO metadata for this news article. Return strict JSON with keys seoTitle, seoDescription, keywords (5-10 items array).\nTitle: ${title}${excerptText}\nContent: ${contentPreview}`

    const llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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
      const t = await llmRes.text()
      return NextResponse.json({ error: `LLM error: ${t}` }, { status: 502 })
    }

    const data = await llmRes.json()
    const contentText: string = data.choices?.[0]?.message?.content || ""

    let parsed
    try {
      parsed = JSON.parse(contentText)
    } catch {
      // Fallback: naive generation if JSON parse fails
      parsed = {
        seoTitle: title,
        seoDescription: content.slice(0, 150),
        keywords: Array.from(new Set(title.split(/\W+/).filter(Boolean))).slice(0, 8),
      }
    }

    return NextResponse.json(parsed)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
