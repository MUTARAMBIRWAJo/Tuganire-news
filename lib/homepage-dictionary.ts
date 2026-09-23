export const homepageDictionary = {
  en: {
    mostRead: "Most Read",
    shared: "Shared",
    latestNews: "Latest News",
    search: "Search newsroom",
    saved: "Saved",
    subscribe: "Stay informed. Stay Tuganire.",
  },
  rw: {
    mostRead: "Byasomwe cyane",
    shared: "Byasangiwe",
    latestNews: "Amakuru aheruka",
    search: "Shakisha amakuru",
    saved: "Byabitswe",
    subscribe: "Menya amakuru. Gumana na Tuganire.",
  },
} as const

export type HomepageMessageLocale = keyof typeof homepageDictionary
export type HomepageMessages = (typeof homepageDictionary)[HomepageMessageLocale]

export function getHomepageDictionary(locale: HomepageMessageLocale): HomepageMessages {
  return homepageDictionary[locale] || homepageDictionary.en
}
