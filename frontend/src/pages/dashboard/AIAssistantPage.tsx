import DashboardLayout from '../../components/DashboardLayout'
import AIChatPanel from '../../components/ai/AIChatPanel'
import { useAIChat } from '@/features/ai/useAIChat'

export default function AIAssistantPage() {
  const chat = useAIChat()

  return (
    <DashboardLayout titleKey="aiAssistant">
      <div className="ai-chat-wrap">
        <AIChatPanel {...chat} />
      </div>
    </DashboardLayout>
  )
}
