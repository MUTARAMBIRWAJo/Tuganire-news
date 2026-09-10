const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const env = {}
for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  if (!line.trim() || line.trim().startsWith('#')) continue
  const idx = line.indexOf('=')
  if (idx > -1) {
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false }
  }
)

;(async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, language, story_group_id, status, published_at')
    .order('published_at', { ascending: false })
    .limit(10)

  console.log(
    JSON.stringify(
      {
        error: error
          ? { message: error.message, details: error.details, hint: error.hint }
          : null,
        rows: data || []
      },
      null,
      2
    )
  )
  process.exit(error ? 1 : 0)
})().catch(err => {
  console.error(err)
  process.exit(1)
})
