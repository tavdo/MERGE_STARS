import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../', import.meta.url))
const read = (file) => readFileSync(path.join(root, file), 'utf8')
const pages = JSON.parse(read('src/seo/public-pages.json'))
let checks = 0
function check(label, fn) {
  fn()
  checks++
  console.log('PASS ' + label)
}
const html = pages.map((page) =>
  read(
    page.path === '/'
      ? 'dist/index.html'
      : 'dist/' + page.path.slice(1) + '.html',
  ),
)
check('01 unique public paths', () =>
  assert.equal(new Set(pages.map((page) => page.path)).size, pages.length),
)
check('02 unique titles', () =>
  assert.equal(new Set(pages.map((page) => page.title)).size, pages.length),
)
check('03 unique descriptions', () =>
  assert.equal(
    new Set(pages.map((page) => page.description)).size,
    pages.length,
  ),
)
check('04 initial HTML contains readable text', () =>
  html.forEach((value, i) => assert(value.includes(pages[i].text))),
)
check('05 one initial H1', () =>
  html.forEach((value) => assert.equal((value.match(/<h1>/g) || []).length, 1)),
)
check('06 canonical URLs', () =>
  html.forEach((value, i) =>
    assert(
      value.includes(
        `rel="canonical" href="https://mergestars.com${pages[i].path}"`,
      ),
    ),
  ),
)
check('07 public index policy', () =>
  html.forEach((value) => {
    assert(value.includes('content="index,follow"'))
    assert(!value.includes('content="noindex'))
  }),
)
check('08 private app shell noindex', () =>
  assert(read('dist/app-shell.html').includes('content="noindex,nofollow"')),
)
check('09 sitemap matches only static allowlist', () => {
  const xml = read('dist/sitemap.xml')
  assert.equal((xml.match(/<loc>/g) || []).length, pages.length)
  for (const page of pages)
    assert(xml.includes('https://mergestars.com' + page.path))
})
check('10 no private entities exported', () => {
  const xml = read('dist/sitemap.xml')
  assert(
    !/login|dashboard|admin|payment|passport|my-|fit-profile|chat|kyc/.test(
      xml,
    ),
  )
})
check('11 no fabricated schema offers', () =>
  html.forEach((value) => {
    const raw = value.match(
      /<script id="merge-stars-jsonld" type="application\/ld\+json">(.*?)<\/script>/s,
    )?.[1]
    const schema = JSON.parse(raw)
    assert.equal(schema['@context'], 'https://schema.org')
    assert(!/"Offer"|"price"|"aggregateRating"/.test(raw))
  }),
)
check('12 sharing metadata and official image', () => {
  assert(
    existsSync(
      path.join(root, 'public/museum/merge-master-logo-canonical.png'),
    ),
  )
  html.forEach((value) =>
    assert(
      value.includes('property="og:image"') &&
        value.includes('name="twitter:card"'),
    ),
  )
})
check('13 robots sitemap and crawlable public links', () => {
  assert(
    read('dist/robots.txt').includes(
      'Sitemap: https://mergestars.com/sitemap.xml',
    ),
  )
  html.forEach((value) => assert(value.includes('<a href="/living-museum">')))
})
check('14 no invented translations or lastmod', () => {
  html.forEach((value) => assert(!value.includes('hreflang=')))
  assert(!read('dist/sitemap.xml').includes('<lastmod>'))
})
console.log(
  `${checks}/14 local foundation checks passed. Not the complete AT-SEO acceptance suite; deployment, public CORE projections, multilingual routes, Search Console and field vitals remain unverified.`,
)
