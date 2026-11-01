import './styles'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { MERGEAIManagerPage } from './components/merge-ai-workspace'
export default function WorkspaceV78() { const user = useAuthStore(state => state.user); return <div className="museum-v78"><MERGEAIManagerPage key={user?.id} signedIn={!!user} /></div> }
