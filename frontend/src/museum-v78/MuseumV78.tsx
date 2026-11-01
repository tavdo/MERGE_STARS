import { useAuthStore } from '@/features/auth/store/auth.store'
import Museum from './components/museum'
import './styles/globals.css'
import './styles/personal-megapolis.css'
import './styles/photo-megapolis.css'
import './styles/merge-ai.css'
import './styles/grand-atrium.css'
import './styles/house-showroom.css'
import './styles/luxury-windows.css'
import './styles/merge-ai-luxury.css'
import './styles/visual-journey.css'
import './styles/museum-world.css'
import './styles/manager-workbench.css'
import './styles/brand-towns.css'
import './styles/spatial-arrival.css'
import './styles/ascension.css'
import './styles/museum-studies.css'
import './styles/fashion-museum.css'
import './styles/photo-scenario.css'

export default function MuseumV78() {
  const user = useAuthStore(state => state.user)
  const token = useAuthStore(state => state.accessToken)
  return <div className="museum-v78"><Museum key={user?.id || 'anonymous'} signedIn={!!user && !!token} sessionScope={user?.id} /></div>
}
