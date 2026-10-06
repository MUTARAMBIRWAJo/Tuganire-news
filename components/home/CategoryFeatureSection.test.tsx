import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import CategoryFeatureSection from "./CategoryFeatureSection"
import HomepageEditorial from "./HomepageEditorial"

describe("CategoryFeatureSection", () => {
  it("uses a wide desktop editorial split and prevents cramped supporting cards", () => {
    const articles = [
      {
        id: "featured",
        slug: "featured-story",
        title: "Featured story with a deliberate headline designed to test layout resilience",
        excerpt: "Summary text",
        content: "Longer article copy to support metadata calculations and layout content.",
        featured_image: "https://images.example.com/featured.jpg",
        published_at: "2026-01-01T00:00:00Z",
        category: { name: "Sports", slug: "sports" },
        author: { display_name: "A. Reporter" },
        language: "en",
      },
      {
        id: "support-1",
        slug: "support-one",
        title: "Support story headline that must stay readable",
        excerpt: "Summary text",
        content: "Longer article copy to support metadata calculations and layout content.",
        featured_image: "https://images.example.com/support-1.jpg",
        published_at: "2026-01-01T00:00:00Z",
        category: { name: "Sports", slug: "sports" },
        author: { display_name: "A. Reporter" },
        language: "en",
      },
      {
        id: "support-2",
        slug: "support-two",
        title: "Another supporting story with enough room for full headline text",
        excerpt: "Summary text",
        content: "Longer article copy to support metadata calculations and layout content.",
        featured_image: "https://images.example.com/support-2.jpg",
        published_at: "2026-01-01T00:00:00Z",
        category: { name: "Sports", slug: "sports" },
        author: { display_name: "A. Reporter" },
        language: "en",
      },
    ]

    const markup = renderToStaticMarkup(
      <CategoryFeatureSection title="Sports" categorySlug="sports" articles={articles} variant="split" locale="en" />,
    )

    expect(markup).toContain("lg:grid-cols-[minmax(0,1.8fr)_minmax(220px,1fr)]")
    expect(markup).toContain("min-w-0")
  })

  it("renders an editorial Tuganire Igenzura section with historical storytelling language", () => {
    const articles = [
      {
        id: "a1",
        slug: "past-present-rwanda",
        title: "How Kigali changed from the 1990s to today",
        excerpt: "A historical look at how urban growth and policy decisions shaped everyday life in Rwanda.",
        image: "https://images.example.com/feature.jpg",
        imageAlt: "Kigali development",
        author: { name: "A. Reporter", role: "Reporter", avatar: null },
        publishedAt: "2026-01-01T00:00:00Z",
        readTime: 6,
        featured: true,
        breaking: false,
        sponsored: false,
      },
      {
        id: "a2",
        slug: "telecom-rwanda",
        title: "How mobile phones changed everyday life in Rwanda",
        excerpt: "The story of how phone access reshaped markets, communication and daily routines.",
        image: "https://images.example.com/telecom.jpg",
        imageAlt: "Rwanda telecom growth",
        author: { name: "A. Reporter", role: "Reporter", avatar: null },
        publishedAt: "2026-01-02T00:00:00Z",
        readTime: 5,
        featured: false,
        breaking: false,
        sponsored: false,
      },
      {
        id: "a3",
        slug: "archive-story",
        title: "From the archive: the institutions that still shape public life",
        excerpt: "A look at the historical institutions that remain central to modern life.",
        image: "https://images.example.com/archive.jpg",
        imageAlt: "Archive story",
        author: { name: "A. Reporter", role: "Reporter", avatar: null },
        publishedAt: "2026-01-03T00:00:00Z",
        readTime: 4,
        featured: false,
        breaking: false,
        sponsored: false,
      },
    ]

    const markup = renderToStaticMarkup(
      <HomepageEditorial articles={articles as any} hero={articles[0] as any} mostRead={articles as any} locale="rw" />,
    )

    expect(markup).toContain("TUGANIRE IGENZURA")
    expect(markup).toContain("Amateka")
    expect(markup).toContain("Uyu munsi mu mateka")
    expect(markup).toContain("Impamvu bikiri ingenzi uyu munsi")
  })
})
