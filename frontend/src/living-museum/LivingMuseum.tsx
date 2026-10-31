import { useAuthStore } from '@/features/auth/store/auth.store'
import { Link } from 'react-router-dom'
import Museum from './components/museum'
import './museum.css'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Megapolis } from './components/megapolis'
import { museumNavigation } from './navigation'

export default function LivingMuseum() {
  const signedIn = useAuthStore(state => !!state.accessToken && !!state.user)
  const [inside,setInside]=useState(()=>!!window.location.search||!!window.location.hash)
  function openMuseum(catalog=false){museumNavigation.catalogOpen=catalog;if(catalog)museumNavigation.entered=true;setInside(true)}
  return <div className="living-museum"><div hidden={inside} inert={inside}><Megapolis active={!inside} onMuseum={()=>openMuseum()} onCatalog={()=>openMuseum(true)}/></div>{inside&&<>{signedIn && <nav className="personal-museum-entry" aria-label="პირადი მუზეუმი"><Link to="/my-museum">ჩემი Brand Museum</Link></nav>}<Museum signedIn={signedIn}/><button className="megapolis-return-city" onClick={()=>setInside(false)}><ArrowLeft size={17}/>ქალაქში დაბრუნება</button></>}</div>
}
