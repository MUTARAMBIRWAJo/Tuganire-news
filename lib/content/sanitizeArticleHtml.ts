import sanitizeHtml from "sanitize-html"

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "a", "b", "blockquote", "br", "caption", "code", "del", "em", "figcaption",
      "figure", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "li",
      "ol", "p", "pre", "s", "strong", "sub", "sup", "table", "tbody", "td",
      "tfoot", "th", "thead", "tr", "u", "ul",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
  })
}
