const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(
  path.join(__dirname, '..', 'lib', 'i18n.ts'),
  'utf8'
)
const common = source.match(/const common = \{([\s\S]*?)\n\} as const/)
const secondaryEn = source.match(
  /const secondaryEn = \{([\s\S]*?)\n\} as const/
)
const secondaryRw = source.match(
  /const secondaryRw = \{([\s\S]*?)\n\} as const/
)
const languageTransferEn = source.match(
  /const languageTransferEn = \{([\s\S]*?)\n\} as const/
)
const languageTransferRw = source.match(
  /const languageTransferRw = \{([\s\S]*?)\n\} as const/
)
const rw = source.match(/rw: \{([\s\S]*?)\n  \}\n\} as const/)

if (
  !common ||
  !secondaryEn ||
  !secondaryRw ||
  !languageTransferEn ||
  !languageTransferRw ||
  !rw
) {
  console.error(
    'Translation source is malformed: expected common, secondary, and rw dictionaries.'
  )
  process.exit(1)
}

const entries = value =>
  [
    ...value.matchAll(
      /([A-Za-z][A-Za-z0-9]*):\s*(["'`])([\s\S]*?)\2(?=,|\n|$)/g
    )
  ].map(match => ({ key: match[1], value: match[3] }))
const englishEntries = [
  ...entries(common[1]),
  ...entries(secondaryEn[1]),
  ...entries(languageTransferEn[1])
]
const rwandanSourceEntries = [
  ...entries(common[1]),
  ...entries(rw[1]),
  ...entries(secondaryRw[1]),
  ...entries(languageTransferRw[1])
]
const effectiveEntries = sourceEntries => [
  ...new Map(sourceEntries.map(entry => [entry.key, entry])).values()
]
const rwandanEntries = effectiveEntries(rwandanSourceEntries)
const englishKeys = new Set(englishEntries.map(entry => entry.key))
const rwandanKeys = new Set(rwandanEntries.map(entry => entry.key))
const missing = [...englishKeys].filter(key => !rwandanKeys.has(key))
const extra = [...rwandanKeys].filter(key => !englishKeys.has(key))
const empty = rwandanEntries
  .filter(entry => !entry.value.trim())
  .map(entry => entry.key)
const duplicateKeys = sourceEntries => [
  ...new Set(
    sourceEntries
      .map(entry => entry.key)
      .filter((key, index, all) => all.indexOf(key) !== index)
  )
]
const duplicates = [
  ...new Set([
    ...duplicateKeys(entries(common[1])),
    ...duplicateKeys(entries(rw[1])),
    ...duplicateKeys(entries(secondaryRw[1])),
    ...duplicateKeys(entries(languageTransferRw[1]))
  ])
]

if (missing.length || extra.length || empty.length || duplicates.length) {
  if (missing.length)
    console.error(`Missing Kinyarwanda keys: ${missing.join(', ')}`)
  if (extra.length)
    console.error(`Unexpected Kinyarwanda keys: ${extra.join(', ')}`)
  if (empty.length) console.error(`Empty Kinyarwanda keys: ${empty.join(', ')}`)
  if (duplicates.length)
    console.error(`Duplicate Kinyarwanda keys: ${duplicates.join(', ')}`)
  process.exit(1)
}

console.log(
  `Translation validation\n----------------------\nEN keys: ${englishKeys.size}\nRW keys: ${rwandanKeys.size}\nMissing EN: ${extra.length}\nMissing RW: ${missing.length}\nEmpty RW: ${empty.length}\nDuplicate keys: ${duplicates.length}\nStatus: PASS`
)
