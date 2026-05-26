(async () => {
  const base = 'http://localhost:3000'
  const out = []
  try {
    const res = await fetch(`${base}/api/public/categories`)
    let data = {}
    if (!res.ok) {
      console.warn('Categories API responded with', res.status, '- will use fallback list')
    } else {
      try {
        data = await res.json()
      } catch (e) {
        data = {}
      }
    }
    const categories = Array.isArray(data.categories) ? data.categories : (Array.isArray(data) ? data : (data?.categories || []))
    let slugs = categories.map(c => c.slug).filter(Boolean)
    if (!slugs.length) {
      // fallback list when categories API is unavailable
      slugs = ['politics', 'business', 'world', 'sports', 'technology', 'entertainment']
      console.warn('Categories API returned no categories — falling back to:', slugs.join(', '))
    } else {
      console.log(`Found ${slugs.length} categories`)
    }

    for (const slug of slugs) {
      try {
        const pageUrl = `${base}/category/${encodeURIComponent(slug)}`
        const pageResp = await fetch(pageUrl, { redirect: 'manual' })
        const pageStatus = pageResp.status

        const apiUrl = `${base}/api/public/articles?category=${encodeURIComponent(slug)}&page=0&pageSize=1`
        const apiResp = await fetch(apiUrl)
        let apiJson = {}
        try { apiJson = await apiResp.json() } catch (e) { apiJson = {} }
        const items = Array.isArray(apiJson.items) ? apiJson.items.length : (Array.isArray(apiJson) ? apiJson.length : 0)

        out.push({ slug, pageStatus, apiStatus: apiResp.status, items })
        process.stdout.write('.')
      } catch (err) {
        out.push({ slug, error: String(err) })
        process.stdout.write('x')
      }
    }

    console.log('\n')
    console.table(out)
    require('fs').writeFileSync('/tmp/category-smoke.json', JSON.stringify(out, null, 2))
  } catch (err) {
    console.error('Smoke test failed:', err)
    process.exit(3)
  }
})()
