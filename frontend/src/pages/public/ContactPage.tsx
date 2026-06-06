import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SiteLayout from '../../components/SiteLayout'

const LABEL = 'font-semibold tracking-[0.12em] text-[11px] block mb-2'
const labelStyle = { color: 'rgba(255,255,255,0.45)' } as const

function ContactIcon({ type }: { type: 'email' | 'phone' | 'location' | 'clock' }) {
  const paths = {
    email: (
      <path
        fill="currentColor"
        d="M2.5 4.5h11A1.5 1.5 0 0 1 15 6v6a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12V6a1.5 1.5 0 0 1 1.5-1.5Zm0 1.2 5.5 3.67L13.5 5.7M2.5 11.3V6.7l5.5 3.67L13.5 6.7v4.6"
      />
    ),
    phone: (
      <path
        fill="currentColor"
        d="M5.2 2.5h1.4c.4 0 .7.3.8.7l.3 1.8c.1.4 0 .8-.3 1.1l-1 1c.8 1.6 2.1 2.9 3.7 3.7l1-1c.3-.3.7-.4 1.1-.3l1.8.3c.4.1.7.4.7.8v1.4c0 .5-.4.9-.9.9C6.8 13.2 2.8 9.2 2.8 4.4c0-.5.4-.9.9-.9Z"
      />
    ),
    location: (
      <>
        <path fill="currentColor" d="M8 1.5a4.2 4.2 0 0 0-4.2 4.2c0 3.1 4.2 7.8 4.2 7.8s4.2-4.7 4.2-7.8A4.2 4.2 0 0 0 8 1.5Zm0 5.7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
      </>
    ),
    clock: (
      <>
        <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path fill="currentColor" d="M8 4.8v3.4l2.2 1.3" />
      </>
    ),
  }

  return (
    <span className="contact-icon-box" aria-hidden>
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        {paths[type]}
      </svg>
    </span>
  )
}

export default function ContactPage() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)

  const subjectKeys = ['general', 'order', 'kyc', 'payment', 'partnership', 'technical'] as const

  const cards = [
    { type: 'email' as const, titleKey: 'emailTitle', lines: ['info@mergestars.com', 'support@mergestars.com'] },
    { type: 'phone' as const, titleKey: 'phoneTitle', lines: ['+1 (555) 123 4567', t('contact.phoneHours')] },
    { type: 'location' as const, titleKey: 'hqTitle', lines: [t('contact.hqLine1'), t('contact.hqLine2')] },
    { type: 'clock' as const, titleKey: 'hoursTitle', lines: [t('contact.aiSupport'), t('contact.humanSupport')] },
  ]

  return (
    <SiteLayout>
      <div className="page-hero">
        <p className="page-kicker">{t('contact.kicker')}</p>
        <h1 className="page-title">
          {t('contact.title')} {t('contact.titleGold') && <span className="gold-text">{t('contact.titleGold')}</span>}
        </h1>
      </div>

      <div className="site-container site-container-wide page-section grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        <div className="gold-card contact-form-card p-8 md:p-10">
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
          {cards.map((c) => (
            <div key={c.titleKey} className="gold-card contact-card p-5 md:p-6 flex gap-4 items-start">
              <ContactIcon type={c.type} />
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
