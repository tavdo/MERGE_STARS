import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Model3DViewer from '@/components/catalog/Model3DViewer'
import type { ConfiguratorSession } from '@/features/coin-configurator/api/configurator.api'

type Props = {
  session: ConfiguratorSession
}

export default function ConfiguratorApplySummaryPanel({ session }: Props) {
  const { t } = useTranslation()
  const products = session.products.filter((p) =>
    ['approved', 'cad_review', 'verified'].includes(p.status),
  )

  return (
    <div className="configurator-apply-summary">
      <div className="configurator-apply-summary-head">
        <h3>{t('configurator.applySummaryTitle', { defaultValue: 'Your MERGE Coin configuration' })}</h3>
        <p>
          {t('configurator.applySummarySub', {
            defaultValue:
              '{{count}} product(s) · {{used}} g used · {{remaining}} g remaining · {{kg}} kg package',
            count: products.length,
            used: session.usedWeightG,
            remaining: session.remainingWeightG,
            kg: session.packageKg,
          })}
        </p>
        {session.sourceBrandHouseId && (
          <p className="configurator-apply-source">
            {t('configurator.source', { defaultValue: 'Source Brand House' })}:{' '}
            <strong>{session.sourceBrandHouseId}</strong>
          </p>
        )}
        <Link to={`/fill-coin?session=${session.id}`} className="text-sm text-[#c9a84c]">
          {t('configurator.editConfig', { defaultValue: 'Edit configuration →' })}
        </Link>
      </div>

      <ul className="configurator-apply-list">
        {products.map((p) => (
          <li key={p.id} className="configurator-apply-item">
            <div className="configurator-apply-item-meta">
              <strong>{p.title}</strong>
              <span>
                {p.weightG ?? p.estimatedWeightG} g
                {p.status === 'cad_review' &&
                  ` · ${t('configurator.pendingCad', { defaultValue: 'CAD review' })}`}
                {p.status === 'verified' &&
                  ` · ${t('configurator.verified', { defaultValue: 'Verified' })}`}
              </span>
            </div>
            {p.model3dUrl && (
              <Model3DViewer modelUrl={p.model3dUrl} className="configurator-apply-viewer" />
            )}
          </li>
        ))}
      </ul>

      {session.caseLayoutJson && (
        <div className="configurator-apply-layout">
          <h4>{t('configurator.autoFitCase', { defaultValue: 'Auto-fit case layout' })}</h4>
          <p className="text-sm text-neutral-400">
            {t('configurator.autoFitNote', {
              defaultValue:
                'Internal compartments are auto-arranged for your approved products. Production team validates before manufacturing.',
            })}
          </p>
          <pre className="configurator-apply-layout-json">
            {JSON.stringify(session.caseLayoutJson, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
