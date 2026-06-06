import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../components/DashboardLayout'
import { coinsApi } from '@/features/coins/api/coins.api'
import { statusLabel } from '@/shared/utils/applicationStatus'

const STEP_ORDER = [
  'submitted',
  'under_review',
  'sent_to_crystal',
  'approved',
  'funds_received',
  'in_production',
  'delivered',
] as const

export default function StatusPage() {
  const { t } = useTranslation()
  const stepLabels = t('status.steps', { returnObjects: true }) as string[]
  const historyItems = t('status.historyItems', { returnObjects: true }) as { status: string; note: string }[]

  const { data: app, isLoading } = useQuery({
    queryKey: ['application-latest'],
    queryFn: () => coinsApi.getLatestApplication().then((r) => r.data.data),
  })

  const statusIndex = app ? STEP_ORDER.indexOf(app.status as typeof STEP_ORDER[number]) : 0
  const safeIndex = statusIndex >= 0 ? statusIndex : 0

  const timeline = stepLabels.map((label, i) => ({
    label,
    done: i <= safeIndex,
    current: i === safeIndex,
    date: i === 0 && app ? new Date(app.submittedAt).toLocaleString() : null,
  }))

  const details = app
    ? [
        { label: t('status.appId'), value: app.id },
        { label: t('status.coinType'), value: app.coinType },
        { label: t('status.submitted'), value: new Date(app.submittedAt).toLocaleString() },
        { label: t('status.totalValue'), value: `$${Number(app.coinValue).toLocaleString()}` },
      ]
    : []

  const history = historyItems.slice(0, 2).map((item, i) => ({
    status: item.status,
    date: app && i === 0 ? new Date(app.updatedAt ?? app.submittedAt).toLocaleString() : app ? new Date(app.submittedAt).toLocaleString() : '—',
    note: item.note,
  }))

  return (
    <DashboardLayout titleKey="status">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="landing-sans-head mb-2">{t('status.header')}</p>
            <h2 className="font-serif-display text-3xl tracking-wide text-[#f5f2eb]">
              {isLoading ? '…' : app?.id ?? t('status.noApplication', { defaultValue: 'No application' })}
            </h2>
          </div>
          {app && (
            <span className="status-badge status-badge--review">
              <span className="dash-pulse-dot shrink-0" />
              {statusLabel(app.status)}
            </span>
          )}
        </div>

        {!app && !isLoading && (
          <div className="dash-panel text-center py-12">
            <p className="text-neutral-500 mb-6">{t('status.empty', { defaultValue: 'You have not submitted an application yet.' })}</p>
            <Link to="/apply" className="gold-btn inline-flex">{t('status.startApplication', { defaultValue: 'Start application' })}</Link>
          </div>
        )}

        {app && (
          <>
            <section className="dash-panel">
              <p className="dash-label mb-8">{t('status.title')}</p>
              <div className="hidden md:block">
                <div className="status-timeline-track">
                  {timeline.map((s, i) => (
                    <div key={s.label} className="status-timeline-step">
                      {i < timeline.length - 1 && (
                        <div className="status-timeline-line" data-done={s.done && !s.current ? 'true' : 'false'} />
                      )}
                      <div className={`status-timeline-dot ${s.current ? 'status-timeline-dot--current' : s.done ? 'status-timeline-dot--done' : ''}`}>
                        {s.current ? '◎' : s.done ? '✓' : ''}
                      </div>
                      <p className="status-timeline-label">{s.label}</p>
                      {s.date && <p className="status-timeline-date">{s.date}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-5">
              <section className="dash-panel">
                <p className="dash-label mb-5">{t('status.details')}</p>
                <dl className="space-y-3">
                  {details.map((d) => (
                    <div key={d.label} className="flex justify-between gap-4 text-[12px]">
                      <dt className="text-neutral-500 tracking-wide">{d.label}</dt>
                      <dd className="text-neutral-200 font-medium text-right">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="dash-panel">
                <p className="dash-label mb-5">{t('status.history')}</p>
                <ul className="space-y-4">
                  {history.map((h) => (
                    <li key={h.status + h.date} className="border-l-2 border-[rgba(212,175,55,0.25)] pl-4">
                      <p className="text-[11px] font-medium text-[#D4AF37]">{h.status}</p>
                      <p className="text-[10px] text-neutral-600 mt-0.5">{h.date}</p>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{h.note}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
