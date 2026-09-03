import { useTranslation } from 'react-i18next'
import type { ConfiguratorProduct } from '@/features/coin-configurator/api/configurator.api'

export type CaseLayoutJson = {
  version?: number
  caseStyle?: string
  diameterCm?: number
  tiers?: number
  centerMergeCoin?: { xPct: number; yPct: number; rPct: number }
  compartments?: Array<{
    productId?: string
    title?: string
    productType?: string
    model3dUrl?: string | null
    weightG?: number
    shape?: string
    tier?: number
    xPct?: number
    yPct?: number
    wPct?: number
    hPct?: number
  }>
}

type Props = {
  layout: CaseLayoutJson | null | undefined
  products?: ConfiguratorProduct[]
  compact?: boolean
}

export default function CoinCaseLayoutView({ layout, products = [], compact }: Props) {
  const { t } = useTranslation()

  const compartments =
    layout?.compartments?.length
      ? layout.compartments
      : products
          .filter((p) => ['approved', 'cad_review', 'verified', 'generated'].includes(p.status))
          .map((p, i) => ({
            productId: p.id,
            title: p.title,
            productType: p.productType,
            model3dUrl: p.model3dUrl,
            weightG: p.weightG ?? p.estimatedWeightG ?? undefined,
            shape: 'rect',
            tier: 1,
            xPct: 20 + (i % 3) * 28,
            yPct: 20 + Math.floor(i / 3) * 26,
            wPct: 18,
            hPct: 16,
          }))

  const center = layout?.centerMergeCoin ?? { xPct: 50, yPct: 48, rPct: 12 }

  return (
    <div className={`coin-case-layout${compact ? ' coin-case-layout--compact' : ''}`}>
      <p className="coin-case-layout-label">
        {t('configurator.caseLayoutTitle', { defaultValue: 'MERGE Coin case — auto-fit layout' })}
      </p>
      <div className="coin-case-tray" aria-label="Coin case compartment layout">
        <div className="coin-case-tray-inner">
          <div
            className="coin-case-center-coin"
            style={{
              left: `${center.xPct}%`,
              top: `${center.yPct}%`,
              width: `${center.rPct * 2}%`,
              height: `${center.rPct * 2}%`,
            }}
          >
            <span>MERGE</span>
            <em>COIN</em>
          </div>

          {compartments.map((slot, i) => (
            <div
              key={slot.productId ?? `slot-${i}`}
              className={`coin-case-slot coin-case-slot--${slot.shape ?? 'rect'} coin-case-slot--tier-${slot.tier ?? 1}`}
              style={{
                left: `${slot.xPct ?? 10}%`,
                top: `${slot.yPct ?? 10}%`,
                width: `${slot.wPct ?? 16}%`,
                height: `${slot.hPct ?? 14}%`,
              }}
              title={slot.title}
            >
              <span className="coin-case-slot-title">{slot.title}</span>
              {slot.weightG != null && (
                <span className="coin-case-slot-weight">{slot.weightG} g</span>
              )}
            </div>
          ))}
        </div>
      </div>
      {layout?.tiers && layout.tiers > 1 && (
        <p className="coin-case-layout-note">
          {t('configurator.caseTiers', {
            defaultValue: '{{n}} levels — items auto-arranged in velvet compartments',
            n: layout.tiers,
          })}
        </p>
      )}
    </div>
  )
}
