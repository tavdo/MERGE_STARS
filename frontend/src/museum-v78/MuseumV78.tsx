import './styles'
import { useAuthStore } from '@/features/auth/store/auth.store'
import Museum from './components/museum'

export default function MuseumV78() {
  const user = useAuthStore(state => state.user)
  const token = useAuthStore(state => state.accessToken)
  return <div className="museum-v78"><Museum key={user?.id || 'anonymous'} signedIn={!!user && !!token} sessionScope={user?.id} /></div>
}
