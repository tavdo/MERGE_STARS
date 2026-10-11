import museumEyewearDetail from './museum/museum-eyewear-detail.jpg'
import museumCoin from './museum/museum-coin.jpg'
import museumAutomotiveSculpture from './museum/museum-automotive-sculpture.jpg'
import museumEyewearHero from './museum/museum-eyewear-hero.jpg'
import museumFashion from './museum/museum-fashion.jpg'
import museumFashionIdentity from './museum/museum-fashion-identity.jpg'
import museumMosaicPlaque from './museum/museum-mosaic-plaque.jpg'
import museumFurniture from './museum/museum-furniture.jpg'
import museumWatchDark from './museum/museum-watch-dark.jpg'
import museumAutomotiveCar from './museum/museum-automotive-car.jpg'
import museumWatchSilver from './museum/museum-watch-silver.jpg'
import museumSpecCoinCase from './museum/museum-spec-coin-case.jpg'
import museumSpecWatchTeal from './museum/museum-spec-watch-teal.jpg'
import museumSpecWatchRed from './museum/museum-spec-watch-red.jpg'
import museumSpecEyewearSilver from './museum/museum-spec-eyewear-silver.jpg'
import museumSpecEyewearMagnetic from './museum/museum-spec-eyewear-magnetic.jpg'
import museumSpecWatchEyeEdition from './museum/museum-spec-watch-eye-edition.jpg'
import museumSpecWatchGlobe from './museum/museum-spec-watch-globe.jpg'
import museumSpecWatchEyeCollection from './museum/museum-spec-watch-eye-collection.jpg'

export type MuseumCategoryKey =
  | 'fashion'
  | 'watchesJewelry'
  | 'eyewear'
  | 'furniture'
  | 'automotive'
  | 'coinMuseum'

export const MUSEUM_HERO_IMAGE = museumEyewearHero

/** Hero spec sheet — Brand Coin Case (Living Museum in your hand) */
export const MUSEUM_HERO_SHOWCASE = museumSpecCoinCase

export const MUSEUM_SECTION_IMAGES = {
  identity: museumFashionIdentity,
  rooms: museumFurniture,
  designLanguage: museumMosaicPlaque,
  personalization: museumEyewearDetail,
  creation: museumWatchSilver,
  intelligence: museumWatchDark,
  physical: museumAutomotiveSculpture,
} as const

export const MUSEUM_CATEGORY_IMAGES: Record<MuseumCategoryKey, string> = {
  fashion: museumFashion,
  watchesJewelry: museumWatchSilver,
  eyewear: museumEyewearHero,
  furniture: museumFurniture,
  automotive: museumAutomotiveCar,
  coinMuseum: museumCoin,
}

export type MuseumShowcaseKey =
  | 'coinCase'
  | 'watchTeal'
  | 'watchRed'
  | 'eyewearSilver'
  | 'eyewearMagnetic'
  | 'watchEyeEdition'
  | 'watchGlobe'
  | 'watchEyeCollection'

export const MUSEUM_SHOWCASE_LINKS: Record<MuseumShowcaseKey, string> = {
  coinCase: '/merge-coin',
  watchTeal: '/brand-room?category=jewelry',
  watchRed: '/brand-room?category=jewelry',
  eyewearSilver: '/brand-room?category=accessories',
  eyewearMagnetic: '/brand-room?category=accessories',
  watchEyeEdition: '/brand-room?category=jewelry',
  watchGlobe: '/brand-room?category=jewelry',
  watchEyeCollection: '/brand-room?category=jewelry',
}

export const MUSEUM_SHOWCASE_EXHIBITS: { key: MuseumShowcaseKey; image: string; to: string }[] = [
  { key: 'coinCase', image: museumSpecCoinCase, to: MUSEUM_SHOWCASE_LINKS.coinCase },
  { key: 'watchTeal', image: museumSpecWatchTeal, to: MUSEUM_SHOWCASE_LINKS.watchTeal },
  { key: 'watchRed', image: museumSpecWatchRed, to: MUSEUM_SHOWCASE_LINKS.watchRed },
  { key: 'eyewearSilver', image: museumSpecEyewearSilver, to: MUSEUM_SHOWCASE_LINKS.eyewearSilver },
  { key: 'eyewearMagnetic', image: museumSpecEyewearMagnetic, to: MUSEUM_SHOWCASE_LINKS.eyewearMagnetic },
  { key: 'watchEyeEdition', image: museumSpecWatchEyeEdition, to: MUSEUM_SHOWCASE_LINKS.watchEyeEdition },
  { key: 'watchGlobe', image: museumSpecWatchGlobe, to: MUSEUM_SHOWCASE_LINKS.watchGlobe },
  { key: 'watchEyeCollection', image: museumSpecWatchEyeCollection, to: MUSEUM_SHOWCASE_LINKS.watchEyeCollection },
]

/** Gallery strip — all exhibit visuals in display order */
export const MUSEUM_GALLERY_IMAGES = [
  museumFashion,
  museumWatchSilver,
  museumEyewearDetail,
  museumFurniture,
  museumAutomotiveCar,
  museumAutomotiveSculpture,
  museumCoin,
] as const
