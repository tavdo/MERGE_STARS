import jewelryIcon from '@/assets/icons/01_jewelry.svg?url'
import accessoriesIcon from '@/assets/icons/02_accessories.svg?url'
import souvenirsIcon from '@/assets/icons/03_souvenirs.svg?url'
import sanitaryIcon from '@/assets/icons/04_sanitary.svg?url'
import stationeryIcon from '@/assets/icons/05_stationery.svg?url'
import constructionIcon from '@/assets/icons/06_construction.svg?url'
import moreIcon from '@/assets/icons/07_more.svg?url'
import filamentIcon from '@/assets/icons/3d-fillament.svg?url'
import metalsIcon from '@/assets/icons/gemini-svg.svg?url'
import globalIcon from '@/assets/icons/gemini-svg (1).svg?url'
import sustainableIcon from '@/assets/icons/gemini-svg (2).svg?url'
import limitlessIcon from '@/assets/icons/gemini-svg (3).svg?url'

import hiwRegister from '@/assets/icons-for-how-it-works/gemini-svg (2).svg?url'
import hiwKyc from '@/assets/icons-for-how-it-works/gemini-svg (3).svg?url'
import hiwBrand from '@/assets/icons-for-how-it-works/gemini-svg (4).svg?url'
import hiwCoin from '@/assets/icons-for-how-it-works/gemini-svg (5).svg?url'
import hiwOrder from '@/assets/icons-for-how-it-works/gemini-svg (6).svg?url'
import hiwPayment from '@/assets/icons-for-how-it-works/gemini-svg (7).svg?url'
import hiwProduction from '@/assets/icons-for-how-it-works/gemini-svg (8).svg?url'
import hiwDelivery from '@/assets/icons-for-how-it-works/gemini-svg (9).svg?url'

/** Landing category cards — matches CATEGORIES keys */
export const CATEGORY_ICONS = {
  jewelry: jewelryIcon,
  accessories: accessoriesIcon,
  souvenirs: souvenirsIcon,
  sanitaryware: sanitaryIcon,
  stationery: stationeryIcon,
  construction: constructionIcon,
  more: moreIcon,
} as const

/** Landing feature bar */
export const FEATURE_ICONS = {
  filament: filamentIcon,
  metals: metalsIcon,
  limitless: limitlessIcon,
  sustainable: sustainableIcon,
  global: globalIcon,
} as const

/** How it works — 8 steps in order */
export const HOW_IT_WORKS_ICONS = [
  hiwRegister,
  hiwKyc,
  hiwBrand,
  hiwCoin,
  hiwOrder,
  hiwPayment,
  hiwProduction,
  hiwDelivery,
] as const

export type CategoryIconKey = keyof typeof CATEGORY_ICONS
export type FeatureIconKey = keyof typeof FEATURE_ICONS
