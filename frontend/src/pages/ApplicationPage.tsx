import ConfiguratorApplySummaryPanel from '../components/application/ConfiguratorApplySummaryPanel'
import { configuratorApi } from '@/features/coin-configurator/api/configurator.api'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import DashboardLayout from '../components/DashboardLayout'
import { coinsApi } from '@/features/coins/api/coins.api'
import { useAuthStore } from '@/features/auth/store/auth.store'

export default function ApplicationPage() {
  const { i18n } = useTranslation()
  const ka = i18n.language.startsWith('ka')
  const user = useAuthStore(s => s.user)
  const [params] = useSearchParams()
  const sessionId = params.get('sessionId')?.trim() || ''
  const session = useQuery({ queryKey: ['configurator-session-apply', sessionId], queryFn: () => configuratorApi.getSession(sessionId).then(r => r.data.data), enabled: !!sessionId })
  const [house, setHouse] = useState('')
  const [line, setLine] = useState('silver')
  const [quantity, setQuantity] = useState(1)
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const submit = useMutation({ mutationFn: () => coinsApi.submitApplication({
    coinType: line, metalType: line, quantity, coinValue: 0,
    brandHouseName: house.trim(), notes: description.trim(),
    firstName: user?.firstName, lastName: user?.lastName,
    deliveryAddress: address.trim() || undefined,
    catalogItemId: params.get('catalogItemId') || undefined,
    configuratorSessionId: sessionId || undefined,
  }) })
  const text = (ge: string, en: string) => ka ? ge : en
  return <DashboardLayout titleKey="application"><div className="apply-flow-wrap apply-flow-max space-y-6">
    <h1>{text('Brand House-ის საწარმოო მოთხოვნა', 'Brand House production request')}</h1>
    <p>{text('MERGE იღებს მოთხოვნას შენი Brand House-ისგან და პარტნიორი კომპანიების მეშვეობით ორგანიზებას უწევს შესრულებასა და გაგზავნას შენს დამკვეთთან.', 'MERGE receives requests from your Brand House and coordinates fulfillment and delivery to your customer through partner companies.')}</p>
    {sessionId && session.isPending && <p role="status">{text('კონფიგურაცია იტვირთება', 'Loading configuration…')}</p>}
    {sessionId && session.isError && <p role="alert">{text('კონფიგურაცია ვერ ჩაიტვირთა', 'Could not load configuration. Return to the configurator and try again.')}</p>}
    {session.data && <ConfiguratorApplySummaryPanel session={session.data} />}
    {submit.isSuccess ? <div role="status"><h2>{text('მოთხოვნა მიღებულია', 'Request received')}</h2><p>{submit.data.data.data.id}</p><p>{text('მოთხოვნა ტექნიკურ შეფასებას ელოდება. ფასი, გადახდა და წარმოება ჯერ არ არის დადასტურებული.', 'The request awaits technical review. Price, payment and production are not yet confirmed.')}</p><Link to="/dashboard">{text('ანგარიშზე დაბრუნება', 'Return to account')}</Link></div> : <form className="space-y-5" onSubmit={e => { e.preventDefault(); if (house.trim() && description.trim() && (!sessionId || session.data?.status === 'finalized')) submit.mutate() }}>
      <label className="block">{text('Brand House-ის დასახელება', 'Brand House name')}<input className="dash-input w-full" required maxLength={120} value={house} onChange={e => setHouse(e.target.value)} /></label>
      <label className="block">Brand Line<select className="dash-input w-full" value={line} onChange={e => setLine(e.target.value)}><option value="silver">Silver</option><option value="gold">Gold</option><option value="premium">Premium</option></select></label>
      <label className="block">{text('ნივთების რაოდენობა — არა კილოგრამები', 'Number of items — not kilograms')}<input className="dash-input w-full" type="number" min={1} max={1000} step={1} required value={quantity} onChange={e => setQuantity(Number(e.target.value))} /></label>
      <label className="block">{text('დიზაინი და მოთხოვნები', 'Design and requirements')}<textarea className="dash-input w-full" required maxLength={5000} value={description} onChange={e => setDescription(e.target.value)} /></label>
      <label className="block">{text('დამკვეთის მიწოდების მისამართი (სურვილისამებრ)', 'Customer delivery address (optional)')}<textarea className="dash-input w-full" maxLength={1000} value={address} onChange={e => setAddress(e.target.value)} /></label>
      <p>{text('ფასი დადგინდება პროდუქტისა და საფასო წონის გადამოწმების შემდეგ. Premium-ის ფორმულა დამტკიცებას ელოდება. მოთხოვნის გაგზავნა გადახდას ან წარმოების დაწყებას არ ნიშნავს.', 'Price follows verification of the product and pricing weight. Premium pricing awaits approval. Submitting a request does not trigger payment or production.')}</p>
      {submit.isError && <p role="alert">{text('მოთხოვნა ვერ გაიგზავნა. გადაამოწმე კავშირი და მონაცემები.', 'Request could not be sent. Check your connection and details.')}</p>}
      <button className="luxury-btn-glass" disabled={submit.isPending || !house.trim() || !description.trim() || (!!sessionId && session.data?.status !== 'finalized')}>{submit.isPending ? text('იგზავნება…', 'Sending…') : text('შეფასებისთვის გაგზავნა', 'Submit for review')}</button>
      <Link className="block" to="/create">{text('დიზაინის სტუდია', 'Design studio')}</Link>
    </form>}
  </div></DashboardLayout>
}
