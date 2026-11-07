export const SITE_URL = 'https://mergestars.com'
export const SITE_NAME = 'MERGE STARS'
export const OG_IMAGE = `${SITE_URL}/museum/merge-master-logo-canonical.png`

/** Route path → i18n key under `seo.pages.*` */
export const PUBLIC_SEO_ROUTES: Record<string, string> = {
  '/': 'home',
  '/how-it-works': 'howItWorks',
  '/merge-coin': 'mergeCoin',
  '/filament': 'filament',
  '/price-indicator': 'prices',
  '/faq': 'faq',
  '/contact': 'contact',
  '/brand-room': 'brandRoom',
  '/living-museum': 'livingMuseum',
  '/museum': 'livingMuseum',
  '/collections': 'collections',
  '/terms': 'terms',
  '/privacy': 'privacy',
  '/trust': 'trust',
  '/login': 'login',
}

export function canonicalUrl(pathname: string) {
  const path = pathname === '/' ? '' : pathname.replace(/\/$/, '')
  return `${SITE_URL}${path}`
}

export const SITE_NAV_LINKS = [
  { name: 'How It Works', path: '/how-it-works' },
  { name: 'MERGE Coin', path: '/merge-coin' },
  { name: 'Filament Technology', path: '/filament' },
  { name: 'Brand Room', path: '/brand-room' },
  { name: 'Living Museum', path: '/living-museum' },
  { name: 'Prices', path: '/price-indicator' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Contact', path: '/contact' },
  { name: 'Register', path: '/login?tab=register' },
] as const

export function siteNavigationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'MERGE STARS main pages',
    itemListElement: SITE_NAV_LINKS.map((link, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: link.name,
      url: `${SITE_URL}${link.path}`,
    })),
  }
}

export function webPageJsonLd(title: string, description: string, path = '/') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${path === '/' ? '' : path}#webpage`,
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    name: title,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['en', 'ka', 'ru', 'fr', 'de', 'tr', 'ar'],
  }
}

export function organizationJsonLd(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: 'MERGE STARS LLC „Merge Varskvlavebi"',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon-32x32.png`,
    description,
    foundingLocation: {
      '@type': 'Place',
      name: 'Tbilisi, Georgia',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'mergestars01@gmail.com',
      contactType: 'customer support',
      availableLanguage: ['English', 'Georgian', 'Russian'],
    },
    knowsAbout: [
      'precious metal filament',
      '3D manufacturing',
      'luxury products',
      'QR digital identity',
      'MERGE Coin',
    ],
    disambiguatingDescription:
      'Official MERGE STARS luxury brand platform at mergestars.com. Not the mobile game Merge Stars: Journey, not a Dart programming package, and not a cryptocurrency.',
  }
}

export function webSiteJsonLd(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['en', 'ka', 'ru', 'fr', 'de', 'tr', 'ar'],
  }
}

export function faqJsonLd(
  items: { question: string; answer: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
