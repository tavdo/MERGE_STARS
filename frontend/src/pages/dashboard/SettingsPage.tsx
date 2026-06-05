import DashboardSimplePage from './DashboardSimplePage'

export default function SettingsPage() {
  return (
    <DashboardSimplePage
      titleKey="settings"
      pageKey="settings"
      linkKeys={[{ labelKey: 'privacyPolicy', to: '/privacy' }]}
    />
  )
}
