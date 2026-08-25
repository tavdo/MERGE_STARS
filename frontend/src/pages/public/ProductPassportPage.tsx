import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import SiteLayout from '@/components/SiteLayout'
import Model3DViewer from '@/components/catalog/Model3DViewer'
import { configuratorApi } from '@/features/coin-configurator/api/configurator.api'

type Passport = {
  publicId: string
  title: string
  productType: string
  weightG: number | null
  estimatedWeightG: number | null
  verifiedWeightG: number | null
  brandHouseId: string | null
  sourceQrRef: string | null
  model3dUrl: string | null
  prompt: string | null
  createdAt: string
}

export default function ProductPassportPage() {
  const { publicId = '' } = useParams()
  const { t } = useTranslation()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product-passport', publicId],
    queryFn: () => configuratorApi.getPassport(publicId).then((r) => r.data.data as Passport),
    enabled: !!publicId,
  })

  return (
    <SiteLayout>
      <div className="passport-page">
        {isLoading && <p className="text-neutral-400">{t('common.loading')}</p>}
        {isError && (
          <p className="text-red-400">
            {t('configurator.passportNotFound', { defaultValue: 'Product passport not found.' })}
          </p>
        )}
        {data && (
          <article className="passport-card">
            <p className="passport-kicker">
              {t('configurator.passportKicker', { defaultValue: 'MERGE PRODUCT PASSPORT' })}
            </p>
            <h1>{data.title}</h1>
            <div className="passport-meta">
              <div>
                <strong>{t('configurator.passportId', { defaultValue: 'Passport ID' })}:</strong>{' '}
                {data.publicId}
              </div>
              <div>
                <strong>{t('configurator.passportType', { defaultValue: 'Product type' })}:</strong>{' '}
                {data.productType}
              </div>
              {data.weightG != null && (
                <div>
                  <strong>{t('configurator.passportWeight', { defaultValue: 'Weight' })}:</strong>{' '}
                  {data.weightG} g
                  {data.verifiedWeightG != null &&
                    ` (${t('configurator.verified', { defaultValue: 'Verified' })})`}
                </div>
              )}
              {data.brandHouseId && (
                <div>
                  <strong>{t('configurator.source', { defaultValue: 'Source Brand House' })}:</strong>{' '}
                  {data.brandHouseId}
                </div>
              )}
              {data.sourceQrRef && (
                <div>
                  <strong>QR:</strong> {data.sourceQrRef}
                </div>
              )}
            </div>
            {data.model3dUrl && (
              <Model3DViewer modelUrl={data.model3dUrl} className="passport-viewer" />
            )}
            {data.prompt && (
              <p className="mt-4 text-sm text-neutral-400 whitespace-pre-wrap">{data.prompt}</p>
            )}
          </article>
        )}
      </div>
    </SiteLayout>
  )
}
