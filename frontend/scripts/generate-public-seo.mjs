import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url)),
  out = path.join(root, 'dist')
const pages = JSON.parse(
  readFileSync(path.join(root, 'src/seo/public-pages.json'), 'utf8'),
)
const origin = 'https://mergestars.com'
const escape = (value) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  )
const template = readFileSync(
  path.join(
    out,
    existsSync(path.join(out, 'app-shell.html'))
      ? 'app-shell.html'
      : 'index.html',
  ),
  'utf8',
)
const clean = template
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/<meta name="robots"[^>]*>/g, '')
writeFileSync(
  path.join(out, 'app-shell.html'),
  clean.replace(
    '</head>',
    '<title>MERGE STARS</title><meta name="robots" content="noindex,nofollow"></head>',
  ),
)
const links = pages
  .map((page) => `<li><a href="${page.path}">${escape(page.heading)}</a></li>`)
  .join('')
for (const page of pages) {
  const canonical = origin + page.path
  const graph = [
    {
      '@type': 'Organization',
      '@id': origin + '/#organization',
      name: 'MERGE STARS',
      url: origin + '/',
    },
    {
      '@type': 'WebPage',
      '@id': canonical,
      url: canonical,
      name: page.title,
      description: page.description,
    },
  ]
  const head = `<title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${canonical}"><meta property="og:type" content="website"><meta property="og:image" content="${origin}/museum/merge-master-logo-canonical.png"><meta name="twitter:card" content="summary"><script id="merge-stars-jsonld" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`
  const content = `<main><h1>${escape(page.heading)}</h1><p>${escape(page.description)}</p><p>${escape(page.text)}</p><nav aria-label="MERGE public pages"><ul>${links}</ul></nav></main>`
  const html = clean
    .replace('</head>', head + '</head>')
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`)
  const target =
    page.path === '/'
      ? path.join(out, 'index.html')
      : path.join(out, page.path.slice(1) + '.html')
  mkdirSync(path.dirname(target), { recursive: true })
  writeFileSync(target, html)
}
writeFileSync(
  path.join(out, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    pages
      .map((page) => `<url><loc>${origin + page.path}</loc></url>`)
      .join('') +
    '</urlset>',
)
writeFileSync(
  path.join(out, 'robots.txt'),
  'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /socket.io/\nSitemap: ' +
    origin +
    '/sitemap.xml\n',
)
console.log(
  `Generated ${pages.length} public HTML pages, private app shell, robots.txt and sitemap.xml. No CORE entities or unverified offers exported.`,
)
