import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { catalogApi } from '@/features/catalog/api/catalog.api'

export default function BrandLinePage() {
  const { t } = useTranslation()
  const [name, setName] = useState('MERGE STAR BRAND')
  const [desc, setDesc] = useState('')
  const [saved, setSaved] = useState(false)

  const { data: collections = [] } = useQuery({
    queryKey: ['catalog-collections'],
    queryFn: () => catalogApi.listMine().then((r) => r.data.data),
  })

  const totalItems = collections.reduce((n, c) => n + c.itemCount, 0)

  const stats = [
    { label: t('brandLine.profileViews'), value: '1,247' },
    { label: t('brandLine.qrScans'), value: '89' },
    { label: t('brandLine.activeProducts'), value: String(totalItems) },
    { label: t('brandLine.brandStatus'), value: t('brandLine.active'), color: '#22c55e' },
  ]

  return (
    <DashboardLayout titleKey="brandLine">
      <div style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '8px' }}>
            {t('brandLine.title')}
          </p>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{t('brandLine.identity')}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px' }}>
          <div className="gold-card" style={{ padding: '32px', borderRadius: '4px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#c9a84c', marginBottom: '24px' }}>
              {t('brandLine.details')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>
                  {t('brandLine.brandName')}
                </label>
                <input
                  className="gold-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('brandLine.brandNamePlaceholder')}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>
                  {t('brandLine.logo')}
                </label>
                <div
                  style={{
                    border: '2px dashed rgba(201,168,76,0.2)',
                    borderRadius: '4px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
                >
                  <p style={{ fontSize: '24px', marginBottom: '8px' }}>📤</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{t('brandLine.uploadLogo')}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>{t('brandLine.logoHint')}</p>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>
                  {t('brandLine.description')}
                </label>
                <textarea
                  className="gold-input"
                  rows={4}
                  placeholder={t('brandLine.descriptionPlaceholder')}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>
                  {t('brandLine.brandLineId')}
                </label>
                <input className="gold-input" value="BRAND-000001" readOnly style={{ color: '#c9a84c' }} />
              </div>
              <button
                className="gold-btn w-full justify-center"
                style={{ borderRadius: '2px' }}
                onClick={() => setSaved(true)}
              >
                {saved ? t('brandLine.savedBtn') : t('brandLine.save')}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="gold-card" style={{ padding: '24px', borderRadius: '4px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#c9a84c', marginBottom: '20px' }}>
                {t('brandLine.preview')}
              </p>
              <div style={{ background: '#080808', borderRadius: '4px', padding: '24px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#c9a84c,#f5d78e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '28px',
                    fontWeight: 900,
                    color: '#000',
                  }}
                >
                  ★
                </div>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  {name || t('brandLine.yourBrand')}
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: '200px', margin: '0 auto' }}>
                  {desc || t('brandLine.descPreview')}
                </p>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '4px 10px',
                      background: 'rgba(201,168,76,0.1)',
                      color: '#c9a84c',
                      border: '1px solid rgba(201,168,76,0.2)',
                      borderRadius: '2px',
                    }}
                  >
                    BRAND-000001
                  </span>
                </div>
              </div>
            </div>

            <div className="gold-card catalog-brand-collections" style={{ padding: '24px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#c9a84c', margin: 0 }}>
                  {t('collections.brandCollections', { defaultValue: 'MY CATALOGS' })}
                </p>
                <Link to="/dashboard/collections" className="text-[11px] text-[#c9a84c] no-underline hover:underline">
                  {t('collections.manageAll', { defaultValue: 'Manage →' })}
                </Link>
              </div>
              {collections.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                  {t('collections.brandEmpty', { defaultValue: 'No catalogs yet. Create your first collection.' })}
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {collections.slice(0, 4).map((c) => (
                    <li key={c.id}>
                      <Link
                        to={`/dashboard/collections/${c.id}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '4px',
                          border: '1px solid rgba(201,168,76,0.12)',
                          textDecoration: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      >
                        <span>{c.title}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{c.itemCount} items</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/dashboard/collections" className="gold-btn w-full justify-center" style={{ borderRadius: '2px', textDecoration: 'none' }}>
                {t('collections.new', { defaultValue: '+ New collection' })}
              </Link>
            </div>

            <div className="gold-card" style={{ padding: '24px', borderRadius: '4px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#c9a84c', marginBottom: '16px' }}>
                {t('brandLine.brandStats')}
              </p>
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: s.color || '#fff' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
