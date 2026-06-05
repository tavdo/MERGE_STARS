import DashboardSimplePage from './DashboardSimplePage'

export default function SupportPage() {
  return (
    <DashboardSimplePage
      titleKey="support"
      pageKey="support"
      linkKeys={[
        { labelKey: 'contactUs', to: '/contact' },
        { labelKey: 'faq', to: '/faq' },
      ]}
    />
  )
}
