import DashboardSimplePage from './DashboardSimplePage'

export default function MessagesPage() {
  return (
    <DashboardSimplePage
      titleKey="messages"
      pageKey="messages"
      linkKeys={[
        { labelKey: 'viewStatus', to: '/status' },
        { labelKey: 'aiAssistant', to: '/dashboard/ai' },
      ]}
    />
  )
}
