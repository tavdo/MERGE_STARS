import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { coinsApi } from '@/features/coins/api/coins.api'
import { ordersApi } from '@/features/orders/api/orders.api'
import { walletApi } from '@/features/wallet/api/wallet.api'
import { financingPreview } from '@/shared/utils/coinPricing'

type Method = 'full' | 'bank' | 'earnings'

export default function PaymentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [method, setMethod] = useState<Method>('bank')
  const [termMonths, setTermMonths] = useState(12)

  const { data: app, isLoading } = useQuery({
    queryKey: ['application-latest'],
    queryFn: () => coinsApi.getLatestApplication().then((r) => r.data.data),
  })

  const { data: wallet } = useQuery({
    queryKey: ['wallet-me'],
    queryFn: () => walletApi.me(10).then((r) => r.data.data),
  })

  const createOrder = useMutation({
    mutationFn: () => ordersApi.create(app!.id, method),
    onSuccess: () => navigate('/dashboard/orders'),
  })

  const coinValue = app ? Number(app.coinValue) : 0
  const earningsBalance = wallet?.balance ?? 0
  const canPayEarnings = earningsBalance >= coinValue && coinValue > 0
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

  const methodCard = (id: Method, title: string, desc: string, note: string, noteColor: string, disabled?: boolean) => (
    <div
      className="gold-card"
      style={{
        padding: '20px',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderColor: method === id ? '#c9a84c' : undefined,
        opacity: disabled ? 0.55 : 1,
      }}
      onClick={() => { if (!disabled) setMethod(id) }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${method === id ? '#c9a84c' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
          {method === id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c9a84c' }} />}
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{title}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
          <p style={{ fontSize: '11px', color: noteColor, marginTop: '8px', fontWeight: 600 }}>{note}</p>
        </div>
      </div>
    </div>
  )

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
            {methodCard(
              'full',
              t('payment.fullPayment'),
              t('payment.fullPaymentDesc', { amount: coinValue.toLocaleString() }),
              t('payment.noFees'),
              '#22c55e',
            )}
            {methodCard(
              'bank',
              t('payment.bankFinancing'),
              t('payment.bankDesc'),
              t('payment.notGuaranteed'),
              '#f59e0b',
            )}
            {methodCard(
              'earnings',
              t('payment.payWithEarnings'),
              t('payment.payWithEarningsDesc', { balance: earningsBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }),
              canPayEarnings
                ? t('payment.earningsEnough')
                : t('payment.earningsShort', { need: coinValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }),
              canPayEarnings ? '#22c55e' : '#f87171',
              !canPayEarnings,
            )}
          </div>

          <div className="gold-card" style={{ padding: '28px', borderRadius: '4px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#c9a84c', marginBottom: '20px' }}>
              {method === 'full' && t('payment.fullSummary')}
              {method === 'bank' && t('payment.financingPreviewTitle')}
              {method === 'earnings' && t('payment.earningsSummary')}
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
            ) : method === 'earnings' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: t('payment.coinValue'), value: `$${coinValue.toLocaleString()}.00` },
                  { label: t('payment.earningsBalance'), value: `$${earningsBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                  { label: t('payment.paymentMethod'), value: t('payment.payWithEarnings') },
                  { label: t('payment.balanceAfter'), value: `$${(earningsBalance - coinValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                ].map((r) => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{r.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{r.value}</span>
                  </div>
                ))}
                {createOrder.isError && (
                  <p style={{ fontSize: '12px', color: '#f87171', marginTop: '12px' }}>
                    {(createOrder.error as { response?: { data?: { message?: string } } })?.response?.data?.message
                      || t('payment.earningsPayFailed')}
                  </p>
                )}
                <button
                  type="button"
                  className="gold-btn w-full justify-center mt-5"
                  disabled={createOrder.isPending || !canPayEarnings}
                  onClick={() => createOrder.mutate()}
                >
                  {createOrder.isPending ? '…' : t('payment.payFromEarnings')}
                </button>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '12px', lineHeight: 1.6 }}>
                  {t('payment.earningsNote')}
                </p>
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
