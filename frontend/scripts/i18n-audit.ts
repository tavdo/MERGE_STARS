import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { mergeLocales } from '../src/i18n/mergeLocales'
import en from '../src/i18n/locales/en'
import ru from '../src/i18n/locales/ru'
import fr from '../src/i18n/locales/fr'
import de from '../src/i18n/locales/de'
import tr from '../src/i18n/locales/tr'
import ka from '../src/i18n/locales/ka'
import ar from '../src/i18n/locales/ar'
import enPages from '../src/i18n/locales/pages/en'
import kaPages from '../src/i18n/locales/pages/ka'
import ruPages from '../src/i18n/locales/pages/ru'
import frPages from '../src/i18n/locales/pages/fr'
import dePages from '../src/i18n/locales/pages/de'
import trPages from '../src/i18n/locales/pages/tr'
import arPages from '../src/i18n/locales/pages/ar'

function flatten(obj: unknown, prefix = '', out: Record<string, unknown> = {}) {
  if (obj == null) return out
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    out[prefix] = obj
    return out
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, p, out)
    else out[p] = v
  }
  return out
}

const locales = {
  en: mergeLocales(en, enPages),
  ka: mergeLocales(ka, kaPages),
  ar: mergeLocales(ar, arPages),
  ru: mergeLocales(ru, ruPages),
  de: mergeLocales(de, dePages),
  fr: mergeLocales(fr, frPages),
  tr: mergeLocales(tr, trPages),
}

const enFlat = flatten(locales.en)
mkdirSync('/tmp/i18n', { recursive: true })
writeFileSync('/tmp/i18n/en.json', JSON.stringify(enFlat, null, 2))

for (const [lang, data] of Object.entries(locales)) {
  if (lang === 'en') continue
  const flat = flatten(data)
  const missing: Record<string, unknown> = {}
  const same: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(enFlat)) {
    if (!(k in flat)) missing[k] = v
    else if (flat[k] === v && typeof v === 'string' && /[A-Za-z]{3,}/.test(v)) same[k] = v
  }
  writeFileSync(`/tmp/i18n/missing-${lang}.json`, JSON.stringify(missing, null, 2))
  writeFileSync(`/tmp/i18n/same-${lang}.json`, JSON.stringify(same, null, 2))
  console.log(lang, 'missing', Object.keys(missing).length, 'sameAsEn', Object.keys(same).length)
}
console.log('en total', Object.keys(enFlat).length)

for (const lang of ['ka', 'ar', 'ru', 'de', 'fr', 'tr']) {
  const missing = JSON.parse(readFileSync(`/tmp/i18n/missing-${lang}.json`, 'utf8')) as Record<string, string>
  const prefixes: Record<string, number> = {}
  for (const k of Object.keys(missing)) {
    const root = k.split('.')[0]
    prefixes[root] = (prefixes[root] || 0) + 1
  }
  console.log(lang, 'missing roots', prefixes)
}
