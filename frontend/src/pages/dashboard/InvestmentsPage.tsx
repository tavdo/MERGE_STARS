import DashboardSimplePage from './DashboardSimplePage'

export default function InvestmentsPage() {
  return (
    <DashboardSimplePage
      titleKey="investments"
      description="Registered Products and Product Registry activity. Values shown are indicative material references only."
      links={[
        { label: 'Price calculator', to: '/calculator' },
        { label: 'Merge coin', to: '/merge-coin' },
      ]}
    />
  )
}
