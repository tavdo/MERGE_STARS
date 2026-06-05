import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'

const TIMELINE_STATE = [
  { done: true, date: '10/05/2024 09:15 AM' },
  { done: true, date: '10/05/2024 11:30 AM', current: true },
  { done: false, date: null },
  { done: false, date: null },
  { done: false, date: null },
  { done: false, date: null },
  { done: false, date: null },
]

const DETAIL_VALUES = {
  appId: 'APP-2024-000567',
  coinType: 'Merge Silver Coin (1KG)',
  submitted: '10/05/2024 09:15 AM',
  totalValue: '$2,450.00',
}

export default function StatusPage() {
  const { t } = useTranslation()
  const stepLabels = t('status.steps', { returnObjects: true }) as string[]
  const historyItems = t('status.historyItems', { returnObjects: true }) as { status: string; note: string }[]

  const timeline = stepLabels.map((label, i) => ({
    label,
    ...(TIMELINE_STATE[i] ?? { done: false, date: null }),
  }))

  const history = [
    { status: historyItems[0]?.status, date: '10/05/2024 11:30 AM', note: historyItems[0]?.note },
    { status: historyItems[1]?.status, date: '10/05/2024 09:15 AM', note: historyItems[1]?.note },
  ]

  const details = [
    { label: t('status.appId'), value: DETAIL_VALUES.appId },
    { label: t('status.coinType'), value: DETAIL_VALUES.coinType },
    { label: t('status.submitted'), value: DETAIL_VALUES.submitted },
    { label: t('status.totalValue'), value: DETAIL_VALUES.totalValue },
  ]

  return (
    <DashboardLayout titleKey="status">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="landing-sans-head mb-2">{t('status.header')}</p>
            <h2 className="font-serif-display text-3xl tracking-wide text-[#f5f2eb]">
              {DETAIL_VALUES.appId}
            </h2>
          </div>
          <span className="status-badge status-badge--review">
            <span className="dash-pulse-dot shrink-0" />
            {t('status.underReview')}
          </span>
        </div>

        <section className="dash-panel">
          <p className="dash-label mb-8">{t('status.title')}</p>

          <div className="hidden md:block">
            <div className="status-timeline-track">
              {timeline.map((s, i) => (
                <div key={s.label} className="status-timeline-step">
                  {i < timeline.length - 1 && (
                    <div
                      className="status-timeline-line"
                      data-done={s.done && !s.current ? 'true' : 'false'}
                    />
                  )}
                  <div
                    className={`status-timeline-dot ${
                      s.current ? 'status-timeline-dot--current' : s.done ? 'status-timeline-dot--done' : ''
                    }`}
                  >
                    {s.current ? '◎' : s.done ? '✓' : ''}
                  </div>
                  <p
                    className={`status-timeline-label ${
                      s.current ? 'text-[#D4AF37]' : s.done ? 'text-neutral-400' : 'text-neutral-600'
                    }`}
                  >
                    {s.label}
                  </p>
                  {s.date && (
                    <p className="text-[9px] tracking-wide text-neutral-600 mt-1 text-center max-w-[88px]">
                      {s.date}
                    </p>
                  )}
                  {s.current && <span className="status-current-pill mt-2">{t('status.current')}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {timeline.map((s, i) => (
              <div key={s.label} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`status-timeline-dot ${
                      s.current ? 'status-timeline-dot--current' : s.done ? 'status-timeline-dot--done' : ''
                    }`}
                  >
                    {s.current ? '◎' : s.done ? '✓' : ''}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="w-px flex-1 min-h-[24px] mt-1 bg-white/[0.06]" />
                  )}
                </div>
                <div className="pb-2">
                  <p className={`text-[11px] font-medium tracking-wide ${s.current ? 'text-[#D4AF37]' : 'text-neutral-300'}`}>
                    {s.label}
                  </p>
                  {s.date && <p className="text-[10px] text-neutral-600 mt-0.5">{s.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <section className="dash-panel h-full">
            <p className="dash-label mb-6">{t('status.history')}</p>
            <ul className="space-y-0">
              {history.map((h, i) => (
                <li key={`${h.status}-${i}`} className="status-history-item">
                  <div className="status-history-rail">
                    <span className="status-history-dot" />
                    {i < history.length - 1 && <span className="status-history-line" />}
                  </div>
                  <div className="pb-6">
                    <p className="text-[11px] font-medium tracking-wide text-neutral-200">{h.status}</p>
                    <p className="text-[10px] text-neutral-600 tracking-wide mt-0.5">{h.date}</p>
                    <p className="text-[10px] text-neutral-500 tracking-wide mt-2 leading-relaxed">{h.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="space-y-5">
            <section className="dash-panel">
              <p className="dash-label mb-5">{t('status.notifications')}</p>
              <div className="status-notice">
                <p className="text-[11px] font-medium tracking-wide text-neutral-200 mb-2">
                  {t('status.notificationTitle')}
                </p>
                <p className="text-[10px] text-neutral-500 tracking-wide leading-relaxed">
                  {t('status.notificationBody')}
                </p>
                <p className="text-[9px] text-neutral-600 tracking-wide mt-3">{t('status.notificationAgo')}</p>
              </div>
              <p className="text-[10px] text-neutral-600 tracking-wide text-center mt-5">
                {t('status.notifyUpdate')}
              </p>
            </section>

            <section className="dash-panel">
              <p className="dash-label mb-5">{t('status.details')}</p>
              <dl className="space-y-0">
                {details.map((d) => (
                  <div key={d.label} className="status-detail-row">
                    <dt className="text-[10px] tracking-wide text-neutral-500">{d.label}</dt>
                    <dd className="text-[10px] font-medium tracking-wide text-neutral-200 text-right">{d.value}</dd>
                  </div>
                ))}
              </dl>
              <Link to="/apply" className="luxury-btn-ghost w-full justify-center mt-6 text-center">
                {t('status.newApplication')}
              </Link>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
