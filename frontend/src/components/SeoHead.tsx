import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import {
  OG_IMAGE,
  PUBLIC_SEO_ROUTES,
  SITE_NAME,
  canonicalUrl,
  faqJsonLd,
  organizationJsonLd,
  siteNavigationJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from '@/seo/siteSeo'
import publicPages from '@/seo/public-pages.json'

const JSON_LD_ID = 'merge-stars-jsonld'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  const selector = `link[rel="${rel}"]`
  let el = document.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function setJsonLd(data: object | object[]) {
  let el = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = JSON_LD_ID
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export default function SeoHead() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()

  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/'
    const page = publicPages.find((entry) => entry.path === path)
    const pageKey = PUBLIC_SEO_ROUTES[path]
    const noindex = !page

    const title = page && i18n.language === 'en' ? page.title : pageKey
      ? t(`seo.pages.${pageKey}.title`, { defaultValue: SITE_NAME })
      : page?.title ?? SITE_NAME

    const description = page && i18n.language === 'en' ? page.description : pageKey
      ? t(`seo.pages.${pageKey}.description`, {
          defaultValue: t('seo.defaultDescription', {
            defaultValue:
              'MERGE STARS — official luxury platform at mergestars.com. 3D precious-metal filament, MERGE Coin with QR digital passport. Not a mobile game or cryptocurrency.',
          }),
        })
      : page?.description ?? t('seo.defaultDescription', {
          defaultValue:
            'MERGE STARS — official luxury platform at mergestars.com. 3D precious-metal filament, MERGE Coin with QR digital passport. Not a mobile game or cryptocurrency.',
        })

    const canonical = path === '/' ? `${canonicalUrl(path)}/` : canonicalUrl(path)

    document.title = title
    if (page) upsertLink('canonical', canonical)
    else document.head.querySelector('link[rel="canonical"]')?.remove()
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'title', title)
    upsertMeta('name', 'application-name', SITE_NAME)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    upsertMeta('name', 'googlebot', noindex ? 'noindex, nofollow' : 'index, follow')

    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', OG_IMAGE)
    upsertMeta('property', 'og:locale', i18n.language === 'ka' ? 'ka_GE' : 'en_US')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', OG_IMAGE)

    if (path === '/' && page) {
      const faqItems = t('seo.faq', { returnObjects: true }) as { q: string; a: string }[]
      const faqList = Array.isArray(faqItems)
        ? faqItems.map((item) => ({ question: item.q, answer: item.a }))
        : []
      setJsonLd([
        organizationJsonLd(description),
        webSiteJsonLd(description),
        webPageJsonLd(title, description, '/'),
        siteNavigationJsonLd(),
        ...(faqList.length ? [faqJsonLd(faqList)] : []),
      ])
    } else if (page) {
      setJsonLd([organizationJsonLd(description), webSiteJsonLd(description), webPageJsonLd(title, description, path)])
    } else {
      const el = document.getElementById(JSON_LD_ID)
      if (el) el.remove()
    }
  }, [pathname, t, i18n.language])

  return null
}
