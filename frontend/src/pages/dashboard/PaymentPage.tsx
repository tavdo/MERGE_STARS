import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { coinsApi } from '@/features/coins/api/coins.api'
import { ordersApi } from '@/features/orders/api/orders.api'
import { financingPreview } from '@/shared/utils/coinPricing'

type Method = 'full' | 'bank'

export default function PaymentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [method, setMethod] = useState<Method>('bank')
  const [termMonths, setTermMonths] = useState(12)

  const { data: app, isLoading } = useQuery({
    queryKey: ['application-latest'],
    queryFn: () => coinsApi.getLatestApplication().then((r) => r.data.data),
  })

  const createOrder = useMutation({
    mutationFn: () =>
      ordersApi.create(app!.id, method === 'full' ? 'full' : 'bank'),
    onSuccess: () => navigate('/dashboard/orders'),
  })

  const coinValue = app ? Number(app.coinValue) : 0
  const { downPayment, toFinance } = financingPreview(coinValue, termMonths)

  if (isLoading) {
    return (
      <DashboardLayout titleKey="payment">
        <p className="text-neutral-500 text-sm">{t('common.loading', { defaultValue: 'Loading…' })}</p>
      </DashboardLayout>
    )
  }

  if (!app) {
    return (
      <DashboardLayout titleKey="payment">
        <div className="max-w-lg space-y-4">
          <p className="apply-lead">{t('payment.noApplication', { defaultValue: 'Submit a coin application before payment.' })}</p>
          <Link to="/apply" className="luxury-btn-glass">{t('orders.newOrder')}</Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout titleKey="payment">
      <div style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '8px' }}>{t('payment.kicker')}</p>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{t('payment.orderLabel', { id: app.id })}</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '8px' }}>{app.coinType}</p>
        </div>

        <div style={{ padding: '16px 20px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px' }}>🔒</span>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>{t('payment.productionLock')}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{t('payment.lockBody')}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}>{t('payment.selectMethod')}</p>
            <div className="gold-card" style={{ padding: '20px', borderRadius: '4px', cursor: 'pointer', borderColor: method === 'full' ? '#c9a84c' : undefined }} onClick={() => setMethod('full')}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${method === 'full' ? '#c9a84c' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  {method === 'full' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c9a84c' }} />}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{t('payment.fullPayment')}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t('payment.fullPaymentDesc', { amount: coinValue.toLocaleString() })}</p>
                  <p style={{ fontSize: '11px', color: '#22c55e', marginTop: '8px', fontWeight: 600 }}>{t('payment.noFees')}</p>
                </div>
              </div>
            </div>
            <div className="gold-card" style={{ padding: '20px', borderRadius: '4px', cursor: 'pointer', borderColor: method === 'bank' ? '#c9a84c' : undefined }} onClick={() => setMethod('bank')}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${method === 'bank' ? '#c9a84c' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  {method === 'bank' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c9a84c' }} />}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{t('payment.bankFinancing')}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t('payment.bankDesc')}</p>
                  <p style={{ fontSize: '11px', color: '#f59e0b', marginTop: '8px', fontWeight: 600 }}>{t('payment.notGuaranteed')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="gold-card" style={{ padding: '28px', borderRadius: '4px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#c9a84c', marginBottom: '20px' }}>
              {method === 'full' ? t('payment.fullSummary') : t('payment.financingPreviewTitle')}
            </p>
            {method === 'full' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: t('payment.coinValue'), value: `$${coinValue.toLocaleString()}.00` },
                  { label: t('payment.paymentMethod'), value: t('payment.bankTransfer') },
                  { label: t('payment.totalDue'), value: `$${coinValue.toLocaleString()}.00` },
                ].map((r) => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{r.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{r.value}</span>
                  </div>
                ))}
                <button
                  type="button"
                  className="gold-btn w-full justify-center mt-5"
                  disabled={createOrder.isPending}
                  onClick={() => createOrder.mutate()}
                >
                  {createOrder.isPending ? '…' : t('payment.proceed')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: t('payment.coinValue'), value: `$${coinValue.toLocaleString()}.00` },
                  { label: t('payment.downPayment'), value: `$${downPayment.toFixed(2)}` },
                  { label: t('payment.amountFinance'), value: `$${toFinance.toFixed(2)}` },
                ].map((r) => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{r.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{r.value}</span>
                  </div>
                ))}
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '8px 0' }}>{t('payment.chooseTerm')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '4px 0 16px' }}>
                  {[12, 24].map((months) => (
                    <button
                      key={months}
                      type="button"
                      className="gold-card"
                      style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', borderRadius: '4px', borderColor: termMonths === months ? '#c9a84c' : undefined }}
                      onClick={() => setTermMonths(months)}
                    >
                      <p style={{ fontSize: '16px', fontWeight: 900, color: '#c9a84c' }}>{t('payment.months', { n: months })}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                        {t('payment.perMonth', { amount: (toFinance / months).toFixed(2) })}
                      </p>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="gold-btn w-full justify-center"
                  disabled={createOrder.isPending}
                  onClick={() => createOrder.mutate()}
                >
                  {createOrder.isPending ? '…' : t('payment.applyFinancing')}
                </button>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '12px', lineHeight: 1.6 }}>{t('payment.crystalNote')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
