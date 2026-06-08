import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { mergeLocales } from './mergeLocales'
import en from './locales/en'
import ru from './locales/ru'
import fr from './locales/fr'
import de from './locales/de'
import tr from './locales/tr'
import ka from './locales/ka'
import ar from './locales/ar'
import enPages from './locales/pages/en'
import kaPages from './locales/pages/ka'
import ruPages from './locales/pages/ru'
import frPages from './locales/pages/fr'
import dePages from './locales/pages/de'
import trPages from './locales/pages/tr'
import arPages from './locales/pages/ar'

export const LANG_STORAGE_KEY = 'merge-stars-lang'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', labelKey: 'lang.en' },
  { code: 'ru', labelKey: 'lang.ru' },
  { code: 'fr', labelKey: 'lang.fr' },
  { code: 'de', labelKey: 'lang.de' },
  { code: 'tr', labelKey: 'lang.tr' },
  { code: 'ka', labelKey: 'lang.ka' },
  { code: 'ar', labelKey: 'lang.ar' },
] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

function readStoredLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
      return stored as LanguageCode
    }
  } catch {
    /* ignore */
  }
  return 'en'
}

const saved = typeof window !== 'undefined' ? readStoredLanguage() : 'en'

function applyDocumentLanguage(lng: string) {
  if (typeof document === 'undefined') return
  const code = lng.slice(0, 2)
  document.documentElement.lang = code
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: mergeLocales(en, enPages) },
    ru: { translation: mergeLocales(ru, ruPages) },
    fr: { translation: mergeLocales(fr, frPages) },
    de: { translation: mergeLocales(de, dePages) },
    tr: { translation: mergeLocales(tr, trPages) },
    ka: { translation: mergeLocales(ka, kaPages) },
    ar: { translation: mergeLocales(ar, arPages) },
  },
  lng: saved,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

if (typeof document !== 'undefined') {
  applyDocumentLanguage(saved)
}

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lng)
  } catch {
    /* ignore */
  }
  applyDocumentLanguage(lng)
})

export default i18n
