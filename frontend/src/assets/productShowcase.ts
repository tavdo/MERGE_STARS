import brandCoinGold from './product-showcase/brand-coin-gold.jpg'
import brandCoinSilver from './product-showcase/brand-coin-silver.jpg'
import businessCardQr from './product-showcase/business-card-qr.png'
import silverCoinAr from './product-showcase/silver-coin-ar.jpg'
import mergeStoneGems from './product-showcase/merge-stone-gems.png'
import mergeStoneGoldLight from './product-showcase/merge-stone-gold-light.png'

export type ShowcaseItemId =
  | 'brandCoinGold'
  | 'brandCoinSilver'
  | 'businessCard'
  | 'silverAr'
  | 'mergeStoneGems'
  | 'mergeStoneGoldLight'

export const SHOWCASE_IMAGES: Record<ShowcaseItemId, string> = {
  brandCoinGold,
  brandCoinSilver,
  businessCard: businessCardQr,
  silverAr: silverCoinAr,
  mergeStoneGems,
  mergeStoneGoldLight,
}

export const SHOWCASE_ITEM_IDS: ShowcaseItemId[] = [
  'brandCoinGold',
  'brandCoinSilver',
  'silverAr',
  'mergeStoneGoldLight',
  'mergeStoneGems',
  'businessCard',
]
