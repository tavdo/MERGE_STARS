import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SiteLayout from '../../components/SiteLayout'

const LABEL = 'font-semibold tracking-[0.12em] text-[11px] block mb-2'
const labelStyle = { color: 'rgba(255,255,255,0.45)' } as const

export default function ContactPage() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)

  const subjectKeys = ['general', 'order', 'kyc', 'payment', 'partnership', 'technical'] as const

  return (
    <SiteLayout>
      <div className="page-hero">
        <p className="page-kicker">{t('contact.kicker')}</p>
        <h1 className="page-title">
          {t('contact.title')} {t('contact.titleGold') && <span className="gold-text">{t('contact.titleGold')}</span>}
        </h1>
      </div>

      <div className="site-container site-container-wide page-section grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        <div className="gold-card p-8 md:p-10">
          {sent ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-lg font-extrabold mb-2" style={{ color: '#c9a84c' }}>{t('contact.messageSent')}</h3>
              <p className="prose-block">{t('contact.messageSentBody')}</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="flex flex-col gap-5">
              <h3 className="text-xs font-bold tracking-[0.2em]" style={{ color: '#c9a84c' }}>{t('contact.sendMessage')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL} style={labelStyle}>{t('contact.firstName')}</label>
                  <input className="gold-input" placeholder={t('contact.firstNamePlaceholder')} required />
                </div>
                <div>
                  <label className={LABEL} style={labelStyle}>{t('contact.lastName')}</label>
                  <input className="gold-input" placeholder={t('contact.lastNamePlaceholder')} required />
                </div>
              </div>
              <div>
                <label className={LABEL} style={labelStyle}>{t('contact.email')}</label>
                <input className="gold-input" type="email" placeholder={t('contact.emailPlaceholder')} required />
              </div>
              <div>
                <label className={LABEL} style={labelStyle}>{t('contact.subject')}</label>
                <select className="gold-input">
                  {subjectKeys.map((key) => (
                    <option key={key}>{t(`contact.subjects.${key}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL} style={labelStyle}>{t('contact.message')}</label>
                <textarea className="gold-input resize-none" rows={5} placeholder={t('contact.messagePlaceholder')} required />
              </div>
              <button type="submit" className="gold-btn w-full justify-center">
                {t('contact.sendButton')}
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {[
            { icon: '✉', titleKey: 'emailTitle', lines: ['info@mergestars.com', 'support@mergestars.com'] },
            { icon: '☎', titleKey: 'phoneTitle', lines: ['+1 (555) 123 4567', t('contact.phoneHours')] },
            { icon: '📍', titleKey: 'hqTitle', lines: [t('contact.hqLine1'), t('contact.hqLine2')] },
            { icon: '🕐', titleKey: 'hoursTitle', lines: [t('contact.aiSupport'), t('contact.humanSupport')] },
          ].map((c) => (
            <div key={c.titleKey} className="gold-card p-5 md:p-6 flex gap-4 items-start">
              <span className="text-xl shrink-0 mt-0.5">{c.icon}</span>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] mb-1.5" style={{ color: '#c9a84c' }}>{t(`contact.${c.titleKey}`)}</p>
                {c.lines.map((l) => (
                  <p key={l} className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{l}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  )
}
