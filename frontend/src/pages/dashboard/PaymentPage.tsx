import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { coinsApi } from '@/features/coins/api/coins.api'

export default function PaymentPage() {
  const { t } = useTranslation()
  const { data: app, isLoading, isError, refetch } = useQuery({
    queryKey: ['application-latest'],
    queryFn: () => coinsApi.getLatestApplication().then((r) => r.data.data),
  })

  return (
    <DashboardLayout titleKey="payment">
      <div className="gold-card max-w-lg space-y-4 p-5">
        <h1>{app ? t('payment.orderLabel', { id: app.id }) : t('payment.productionLock')}</h1>
        {isLoading && <p role="status">{t('common.loading')}</p>}
        {isError && <button type="button" className="luxury-btn-glass" onClick={() => void refetch()}>{t('payment.retryApplication')}</button>}
        {!isLoading && !isError && (app ? (
          <p>{t('payment.verifiedOfferRequired')}</p>
        ) : (
          <>
            <p>{t('payment.noApplication', { defaultValue: 'Submit a coin application before payment.' })}</p>
            <Link to="/apply" className="luxury-btn-glass">{t('orders.newOrder')}</Link>
          </>
        ))}
      </div>
    </DashboardLayout>
  )
}
