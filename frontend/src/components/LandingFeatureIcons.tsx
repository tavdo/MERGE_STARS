/* eslint-disable react-refresh/only-export-components */
import BrandIcon from './BrandIcon'
import { FEATURE_ICONS, type FeatureIconKey } from '@/assets/brandIcons'

type IconProps = { className?: string }

function featureIcon(key: FeatureIconKey) {
  return function FeatureAssetIcon({ className = 'w-9 h-9' }: IconProps) {
    return <BrandIcon src={FEATURE_ICONS[key]} className={`landing-feature-icon ${className}`.trim()} />
  }
}

export const IconFilament3D = featureIcon('filament')
export const IconPreciousMetals = featureIcon('metals')
export const IconLimitless = featureIcon('limitless')
export const IconSustainable = featureIcon('sustainable')
export const IconGlobal = featureIcon('global')

export const FEATURE_ICON_MAP = {
  filament: IconFilament3D,
  metals: IconPreciousMetals,
  limitless: IconLimitless,
  sustainable: IconSustainable,
  global: IconGlobal,
} as const
