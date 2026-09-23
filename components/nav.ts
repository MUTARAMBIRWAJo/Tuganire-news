export const nav = [
  { href: '/', key: 'home' },
  { href: '/articles', key: 'latestNews' },
  { href: '/category/politics', key: 'politics' },
  { href: '/category/business', key: 'business' },
  { href: '/category/technology', key: 'technology' },
  { href: '/category/sports', key: 'sports' },
  { href: '/category/culture', key: 'culture' },
  { href: '/search', key: 'search' },
]

export type NavItem = { href: string; key: string }
