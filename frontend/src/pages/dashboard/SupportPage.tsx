import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { contactApi } from '@/features/contact/api/contact.api'

export default function SupportPage() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'Support',
    message: '',
  })

  const send = useMutation({
    mutationFn: () => contactApi.sendMessage(form),
    onSuccess: () => setSent(true),
  })

  return (
    <DashboardLayout titleKey="support">
      <div style={{ maxWidth: '640px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '8px' }}>SUPPORT</p>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '24px' }}>{t('dashboard.titles.support')}</h1>

        <div className="gold-card" style={{ padding: '28px', borderRadius: '4px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#c9a84c', marginBottom: '8px' }}>Message sent</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>We will respond to {form.email} within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); send.mutate() }} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input className="gold-input" placeholder="First name" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required />
                <input className="gold-input" placeholder="Last name" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required />
              </div>
              <input className="gold-input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              <select className="gold-input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
                <option>Support</option>
                <option>Order</option>
                <option>KYC</option>
                <option>Payment</option>
                <option>Technical</option>
              </select>
              <textarea className="gold-input resize-none" rows={5} placeholder="Describe your issue…" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} required />
              <button type="submit" className="gold-btn w-full justify-center" disabled={send.isPending}>{send.isPending ? '…' : 'Send to support'}</button>
            </form>
          )}
        </div>

        <p style={{ marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          Email: Mergestar01@gmail.com · Phone: +995 557 513 613
        </p>
      </div>
    </DashboardLayout>
  )
}
