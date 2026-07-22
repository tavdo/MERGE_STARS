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
import enFill from '../src/i18n/locales/fills/en'
import kaFill from '../src/i18n/locales/fills/ka'
import arFill from '../src/i18n/locales/fills/ar'
import ruFill from '../src/i18n/locales/fills/ru'
import deFill from '../src/i18n/locales/fills/de'
import frFill from '../src/i18n/locales/fills/fr'
import trFill from '../src/i18n/locales/fills/tr'
import enMergeCoin from '../src/i18n/locales/pages/merge-coin-en'
import kaMergeCoin from '../src/i18n/locales/pages/merge-coin-ka'
import arMergeCoin from '../src/i18n/locales/pages/merge-coin-ar'
import ruMergeCoin from '../src/i18n/locales/pages/merge-coin-ru'
import deMergeCoin from '../src/i18n/locales/pages/merge-coin-de'
import frMergeCoin from '../src/i18n/locales/pages/merge-coin-fr'
import trMergeCoin from '../src/i18n/locales/pages/merge-coin-tr'

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
  en: mergeLocales(en, enPages, enFill, enMergeCoin),
  ka: mergeLocales(ka, kaPages, kaFill, kaMergeCoin),
  ar: mergeLocales(ar, arPages, arFill, arMergeCoin),
  ru: mergeLocales(ru, ruPages, ruFill, ruMergeCoin),
  de: mergeLocales(de, dePages, deFill, deMergeCoin),
  fr: mergeLocales(fr, frPages, frFill, frMergeCoin),
  tr: mergeLocales(tr, trPages, trFill, trMergeCoin),
}

const enFlat = flatten(locales.en)
mkdirSync('/tmp/i18n', { recursive: true })
writeFileSync('/tmp/i18n/en.json', JSON.stringify(enFlat, null, 2))

const brandOk = /^(MERGE STARS|MERGE COIN|Crystal|QR Identity|Meshy|STAR JEWELRY HOUSE|ID \d+|https?:)/i

for (const [lang, data] of Object.entries(locales)) {
  if (lang === 'en') continue
  const flat = flatten(data)
  const missing: Record<string, unknown> = {}
  const same: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(enFlat)) {
    if (!(k in flat)) missing[k] = v
    else if (
      flat[k] === v &&
      typeof v === 'string' &&
      /[A-Za-z]{3,}/.test(v) &&
      !brandOk.test(v) &&
      !v.includes('@') &&
      !v.startsWith('+')
    ) {
      same[k] = v
    }
  }
  writeFileSync(`/tmp/i18n/missing-${lang}.json`, JSON.stringify(missing, null, 2))
  writeFileSync(`/tmp/i18n/same-${lang}.json`, JSON.stringify(same, null, 2))
  console.log(lang, 'missing', Object.keys(missing).length, 'sameAsEn', Object.keys(same).length)
}
console.log('en total', Object.keys(enFlat).length)
