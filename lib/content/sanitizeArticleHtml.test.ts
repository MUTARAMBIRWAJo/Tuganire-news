import { describe, expect, it } from "vitest"
import { sanitizeArticleHtml } from "./sanitizeArticleHtml"

describe("sanitizeArticleHtml", () => {
  it("removes executable elements, event handlers, and unsafe URL schemes", () => {
    const html = '<p onclick="alert(1)">News</p><script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">read</a>'
    const sanitized = sanitizeArticleHtml(html)

    expect(sanitized).toContain("<p>News</p>")
    expect(sanitized).not.toContain("<script")
    expect(sanitized).not.toContain("onclick")
    expect(sanitized).not.toContain("onerror")
    expect(sanitized).not.toContain("javascript:")
  })

  it("preserves safe editorial markup and HTTPS links", () => {
    const sanitized = sanitizeArticleHtml('<h2>News</h2><p><strong>Important</strong> <a href="https://example.com">source</a></p>')

    expect(sanitized).toContain("<h2>News</h2>")
    expect(sanitized).toContain("<strong>Important</strong>")
    expect(sanitized).toContain('href="https://example.com"')
  })
})
