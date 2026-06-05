import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SiteLayout from '../../components/SiteLayout'

type FaqItem = { q: string; a: string }

export default function FAQPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<number | null>(null)
  const faqs = t('faq.items', { returnObjects: true }) as FaqItem[]

  return (
    <SiteLayout>
      <div className="page-hero">
        <p className="page-kicker">{t('faq.kicker')}</p>
        <h1 className="page-title">
          {t('faq.title')} <span className="gold-text">{t('faq.titleGold')}</span>
        </h1>
      </div>

      <div className="site-container site-container-narrow page-section">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border-b border-[rgba(201,168,76,0.12)] cursor-pointer"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div className="flex justify-between items-center gap-4 py-5">
              <h2 className="text-base font-bold text-white flex-1 leading-snug pr-2" style={{ color: open === i ? '#c9a84c' : '#fff' }}>
                {faq.q}
              </h2>
              <span
                className="text-xl shrink-0 transition-transform duration-200"
                style={{ color: '#c9a84c', transform: open === i ? 'rotate(45deg)' : 'none' }}
              >
                +
              </span>
            </div>
            {open === i && (
              <div className="pb-5">
                <p className="prose-block">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="section-divider-soft" />
      <div className="text-center page-section px-4">
        <p className="text-base mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {t('faq.stillHaveQuestions')}
        </p>
        <Link to="/contact" className="gold-btn inline-flex">
          {t('faq.contactUs')}
        </Link>
      </div>
    </SiteLayout>
  )
}
