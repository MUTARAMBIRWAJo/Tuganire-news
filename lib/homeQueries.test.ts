import { afterEach, describe, expect, it, vi } from "vitest"

const mockCreateClient = vi.fn()

vi.mock("@supabase/supabase-js", () => ({
  createClient: mockCreateClient,
}))

type QueryBuilder = {
  select: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  neq: ReturnType<typeof vi.fn>
  not: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
  lte: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  then: (onfulfilled?: (value: any) => any, onrejected?: (reason?: unknown) => any) => Promise<any>
}

function createQueryBuilder(result: any): QueryBuilder {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
    then: (onfulfilled?: (value: any) => any, onrejected?: (reason?: unknown) => any) => Promise.resolve(result).then(onfulfilled, onrejected),
  }

  return builder
}

describe("getMostPopular", () => {
  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it("falls back to published article views when the analytics client is unavailable", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key")
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "")

    const articleRows = [
      {
        id: "1",
        slug: "story-one",
        story_group_id: "group-1",
        title: "Story One",
        excerpt: "Excerpt one",
        featured_image: null,
        published_at: "2026-01-01T00:00:00Z",
        views_count: 120,
        category: { name: "News", slug: "news" },
        author: { display_name: "Jane Reporter", avatar_url: null },
      },
      {
        id: "2",
        slug: "story-two",
        story_group_id: "group-2",
        title: "Story Two",
        excerpt: "Excerpt two",
        featured_image: null,
        published_at: "2026-01-02T00:00:00Z",
        views_count: 80,
        category: { name: "World", slug: "world" },
        author: { display_name: "John Writer", avatar_url: null },
      },
    ]

    mockCreateClient.mockImplementation(() => ({
      from: (table: string) => {
        if (table === "articles") {
          return createQueryBuilder({ data: articleRows, error: null })
        }

        if (table === "comments") {
          return createQueryBuilder({ count: 2 })
        }

        throw new Error(`Unexpected table: ${table}`)
      },
    }))

    const { getMostPopular } = await import("./homeQueries")

    const result = await getMostPopular(6, 7, "en")

    expect(result).toHaveLength(2)
    expect(result[0].title).toBe("Story One")
    expect(result[0].views_count).toBe(120)
  })

  it("falls back to views_count sorting when analytics has no article rows", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key")
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key")

    const articleRows = [
      {
        id: "1",
        slug: "story-one",
        story_group_id: "group-1",
        title: "Story One",
        excerpt: "Excerpt one",
        featured_image: null,
        published_at: "2026-01-01T00:00:00Z",
        views_count: 120,
        category: { name: "News", slug: "news" },
        author: { display_name: "Jane Reporter", avatar_url: null },
      },
      {
        id: "2",
        slug: "story-two",
        story_group_id: "group-2",
        title: "Story Two",
        excerpt: "Excerpt two",
        featured_image: null,
        published_at: "2026-01-02T00:00:00Z",
        views_count: 80,
        category: { name: "World", slug: "world" },
        author: { display_name: "John Writer", avatar_url: null },
      },
    ]

    mockCreateClient.mockImplementation(() => ({
      from: (table: string) => {
        if (table === "article_views_detailed") {
          return createQueryBuilder({ data: [], error: null })
        }

        if (table === "articles") {
          return createQueryBuilder({ data: articleRows, error: null })
        }

        if (table === "comments") {
          return createQueryBuilder({ count: 2 })
        }

        throw new Error(`Unexpected table: ${table}`)
      },
    }))

    const { getMostPopular } = await import("./homeQueries")

    const result = await getMostPopular(6, 7, "en")

    expect(result).toHaveLength(2)
    expect(result[0].title).toBe("Story One")
  })
})
