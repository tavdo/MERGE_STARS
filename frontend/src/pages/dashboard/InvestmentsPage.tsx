import DashboardSimplePage from './DashboardSimplePage'

export default function InvestmentsPage() {
  return (
    <DashboardSimplePage
      titleKey="investments"
      pageKey="investments"
      linkKeys={[
        { labelKey: 'viewRegistry', to: '/dashboard/investments' },
        { labelKey: 'newApplication', to: '/apply' },
      ]}
    />
  )
}
