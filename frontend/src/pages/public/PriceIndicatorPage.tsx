import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'
import type { LiveMetalPrice } from '@/features/coins/api/metals.api'
type Reference = { ruleVersion: string; silverMinor: number | null; goldMinor: number | null; metals: LiveMetalPrice[] }
export default function PriceIndicatorPage() {
  const { i18n } = useTranslation()
  const ka = i18n.language.startsWith('ka')
  const [now, setNow] = useState(Date.now)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [])
  const { data } = useQuery({ queryKey: ['brand-line-reference'], queryFn: () => api.get<ApiResponse<Reference>>('/metals/brand-line-reference').then(r => r.data.data), refetchInterval: 30000 })
  const fresh = (metal: string) => data?.metals.some(m => m.metal === metal && Date.parse(m.validUntil) > now)
  const money = (value: number | null | undefined, valid: boolean | undefined) => value != null && valid ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value / 100) : (ka ? 'ფასი დაუდასტურებელია' : 'Price unverified')
  return <div style={{ background: '#080808', color: '#f4eee0', minHeight: '100vh' }}><Navbar /><main style={{ maxWidth: 900, margin: 'auto', padding: '160px 24px 80px' }}>
    <h1>{ka ? 'Brand Line-ის ფასდადგენა' : 'Brand Line pricing'}</h1>
    <p>{ka ? 'საცნობარო ფასი 1 კგ საფასო ერთეულისთვის. პროდუქტის ფიზიკური წონა და ლითონის შემცველობა ცალკე მოწმდება.' : 'Reference for one pricing kg. Physical product weight and precious-metal content are verified separately.'}</p>
    {[['Silver Line', '2 × Ag LIVE/kg', money(data?.silverMinor, fresh('silver'))], ['Gold Line', '1 × Au LIVE/kg', money(data?.goldMinor, fresh('gold'))], ['Premium Line', ka ? 'ფორმულა დამტკიცებას ელოდება' : 'Formula pending approval', ka ? 'ფასი დაუდასტურებელია' : 'Premium Line pricing pending verification.']].map(([name, formula, price]) => <section key={name} style={{ border: '1px solid #b28d43', padding: 24, marginTop: 24 }}><h2>{name}</h2><p>{formula}</p><strong>{price}</strong></section>)}
    {data?.metals.filter(m => Date.parse(m.validUntil) > now).map(m => <p key={m.metal}>{m.metal}: {m.pricePerKgUsd} USD/kg · {m.source} · {new Date(m.sourceTimestamp).toLocaleString()}</p>)}
    <p style={{ marginTop: 32 }}>{ka ? 'საბოლოო შეთავაზებას სჭირდება Brand House-ის პროდუქტის დამტკიცებული მონაცემები, საფასო წონა და დაფიქსირებული ფასი. ეს გვერდი შეკვეთას არ ქმნის.' : 'A final offer requires verified Brand House product data, pricing weight and a price lock. This page does not create an order.'}</p>
    <small>{data?.ruleVersion}</small>
  </main><Footer /></div>
}
