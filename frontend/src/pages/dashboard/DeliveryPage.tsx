import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { ordersApi } from '@/features/orders/api/orders.api'

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function deliveryStepIndex(status: string) {
  switch (status) {
    case 'delivered':
      return 7
    case 'in_transit':
      return 5
    case 'processing':
      return 3
    case 'pending':
    default:
      return 1
  }
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  in_transit: 'In transit',
  delivered: 'Delivered',
}

export default function DeliveryPage() {
  const { t } = useTranslation()

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['delivery-latest'],
    queryFn: () => ordersApi.latestDelivery().then((r) => r.data.data),
    retry: false,
  })

  const stepLabels = t('delivery.steps', { returnObjects: true }) as { label: string; icon: string }[]
  const currentStep = order ? deliveryStepIndex(order.deliveryStatus) : 0

  const steps = stepLabels.map((s, i) => ({
    ...s,
    done: i <= currentStep,
    current: i === currentStep,
    date:
      i === 0
        ? formatDate(order?.createdAt ?? null)
        : i === currentStep && order?.shippedAt
          ? formatDate(order.shippedAt)
          : i === stepLabels.length - 1 && order?.deliveredAt
            ? formatDate(order.deliveredAt)
            : null,
  }))

  if (isLoading) {
    return (
      <DashboardLayout titleKey="delivery">
        <p className="text-neutral-500 text-sm">{t('common.loading')}</p>
      </DashboardLayout>
    )
  }

  if (isError || !order) {
    return (
      <DashboardLayout titleKey="delivery">
        <div className="max-w-lg space-y-4">
          <p className="apply-lead">{t('delivery.noOrder', { defaultValue: 'No delivery yet. Place an order first.' })}</p>
          <Link to="/dashboard/orders" className="luxury-btn-glass">{t('dashboard.nav.orders')}</Link>
        </div>
      </DashboardLayout>
    )
  }

  const statusLabel = STATUS_LABELS[order.deliveryStatus] ?? order.deliveryStatus

  return (
    <DashboardLayout titleKey="delivery">
      <div className="max-w-3xl space-y-6">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] text-[#c9a84c] mb-2">{t('delivery.kicker')}</p>
          <h1 className="text-2xl font-bold text-white">{t('delivery.orderLabel', { id: order.id })}</h1>
        </div>

        <div className="apply-surface p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t('delivery.trackingCode'), value: order.trackingCode ?? '—', color: '#c9a84c' },
            { label: t('delivery.courier'), value: order.courier ?? '—', color: '#fff' },
            { label: t('delivery.estDelivery'), value: formatDate(order.estDeliveryAt)?.split(',')[0] ?? '—', color: '#fff' },
            { label: t('delivery.statusLabel'), value: statusLabel, color: '#f59e0b' },
          ].map((d) => (
            <div key={d.label}>
              <p className="text-[10px] text-neutral-500 tracking-wider mb-1">{d.label}</p>
              <p className="text-sm font-bold" style={{ color: d.color }}>{d.value}</p>
            </div>
          ))}
        </div>

        <div className="apply-surface p-8">
          <p className="text-xs font-bold tracking-[0.2em] text-[#c9a84c] mb-6">{t('delivery.timeline')}</p>
          <div className="space-y-0">
            {steps.map((s, i) => (
              <div key={s.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 border ${
                      s.current
                        ? 'bg-gradient-to-br from-[#c9a84c] to-[#f5d78e] text-black border-transparent'
                        : s.done
                          ? 'border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.1)] text-[#c9a84c]'
                          : 'border-white/10 bg-[#111] text-neutral-600'
                    }`}
                  >
                    {s.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-px h-8 my-1 ${s.done ? 'bg-[rgba(201,168,76,0.3)]' : 'bg-white/5'}`} />
                  )}
                </div>
                <div className="pt-1.5 pb-4">
                  <p className={`text-sm ${s.current ? 'text-[#c9a84c] font-bold' : s.done ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    {s.label}
                    {s.current && (
                      <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
                        {t('delivery.current')}
                      </span>
                    )}
                  </p>
                  {s.date && <p className="text-[10px] text-neutral-500 mt-0.5">{s.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
