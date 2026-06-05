import DashboardSimplePage from './DashboardSimplePage'

export default function ProfilePage() {
  return (
    <DashboardSimplePage
      titleKey="profile"
      pageKey="profile"
      linkKeys={[
        { labelKey: 'newApplication', to: '/apply' },
        { labelKey: 'settings', to: '/dashboard/settings' },
      ]}
    />
  )
}
