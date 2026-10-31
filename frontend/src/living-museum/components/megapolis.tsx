import { useAuthStore } from '@/features/auth/store/auth.store';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Compass, Expand, Map, MessageCircle, Minus, Plus, RotateCcw, Search, Settings2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import MergeMasterLogo from '@/components/MergeMasterLogo';
import { CoreCatalogBrowser } from './core-context';
import '../megapolis.css';
import '../megapolis-refinement.css';

export const cityHouses = [
  {id:'mosaic',title:'MOSAIC HOUSE',label:'მოზაიკა და ხელოვნება',category:'art',x:12,y:59,items:['მოზაიკა','ხელოვნება','სკულპტურა']},
  {id:'games',title:'GAME HOUSE',label:'თამაშები და სათამაშოები',category:'toys',x:23,y:63,items:['ჭადრაკი','სამაგიდო თამაშები','რბილი სათამაშოები','კონსტრუქტორები','საგანმანათლებლო','ჩვილის სათამაშოები','გარე თამაშები','მუსიკალური სათამაშოები','ინტერაქტიული სათამაშოები']},
  {id:'fashion',title:'FASHION HOUSE',label:'სამოსი და აქსესუარები',category:'fashion',x:30,y:66,items:['ტანსაცმელი','ფეხსაცმელი','ჩანთები და ქეისები','ქუდები','ქამრები','ჰალსტუხები და ბაფთები','შარფები და შალები','ხელთათმანები','აქსესუარები']},
  {id:'robotics',title:'ROBOTICS HOUSE',label:'რობოტიკა',category:'technology',x:76,y:64,items:['რობოტიკა','ტექნოლოგია']},
  {id:'music',title:'MUSIC HOUSE',label:'მუსიკალური ინსტრუმენტები',category:'music',x:88,y:59,items:['კლავიშიანი','სიმებიანი','ჩასაბერი','დასარტყამი']},
  {id:'watch',title:'WATCH HOUSE',label:'საათები',category:'watches',x:39,y:58,items:['მაჯის საათები','საკოლექციო საათები']},
  {id:'jewelry',title:'JEWELRY HOUSE',label:'სამკაულები',category:'jewelry',x:65,y:57,items:['ბეჭდები','ყელსაბამები','საყურეები','სამაჯურები']},
  {id:'eyewear',title:'EYEWEAR HOUSE',label:'სათვალეები',category:'eyewear',x:35,y:52,items:['სათვალეები','ფუტლარები']},
  {id:'interior',title:'INTERIOR HOUSE',label:'ავეჯი და ინტერიერი',category:'furniture',x:70,y:48,items:['ავეჯი','ინტერიერი']},
  {id:'automotive',title:'AUTOMOTIVE HOUSE',label:'ტრანსპორტი',category:'transport',x:28,y:46,items:['ავტომობილები','მოტოციკლები','სხვა ტრანსპორტი']},
  {id:'stationery',title:'STATIONERY HOUSE',label:'საკანცელარიო ნივთები',category:'stationery',x:73,y:42,items:['საწერი ნივთები','საკანცელარიო აქსესუარები']},
  {id:'nature',title:'NATURE HOUSE',label:'ბუნება და გარემო',category:'art',x:37,y:40,items:['ბუნების სკულპტურა','ბაღის კოლექცია']},
] as const;
type House = typeof cityHouses[number];
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));

export function Megapolis({onMuseum:requestMuseum,onCatalog:requestCatalog,active=true}:{onMuseum:()=>void;onCatalog:()=>void;active?:boolean}) {
  const signedIn = useAuthStore(state => !!state.accessToken && !!state.user);
  const root=useRef<HTMLElement>(null),drag=useRef<{x:number;y:number;px:number;py:number}|null>(null);
  const [position,setPosition]=useState({x:50,y:52,zoom:1});
  const [panel,setPanel]=useState<'map'|'settings'|'chat'|null>(null),[house,setHouse]=useState<House|null>(null);
  const [query,setQuery]=useState(''),[catalog,setCatalog]=useState(false),[motion,setMotion]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [full,setFull]=useState(false);
  const blocked=!active||!!panel||!!house;
  function leaveCity(action:()=>void){setPanel(null);setHouse(null);setCatalog(false);action();}
  const onMuseum=()=>leaveCity(requestMuseum);
  const onCatalog=()=>leaveCity(requestCatalog);
  function move(dx:number,dy:number){setPosition(p=>({...p,x:clamp(p.x+dx,25,75),y:clamp(p.y+dy,35,65),zoom:Math.max(p.zoom,1.12)}));}
  function openHouse(next:House){setHouse(next);setCatalog(false);setPanel(null);}
  useEffect(()=>{const changed=()=>setFull(document.fullscreenElement===root.current);document.addEventListener('fullscreenchange',changed);return()=>document.removeEventListener('fullscreenchange',changed);},[]);
  useEffect(()=>{if(blocked)return;const key=(e:KeyboardEvent)=>{if((e.target as HTMLElement).closest('input,button,a,select,textarea'))return;const d:Record<string,[number,number]>={ArrowLeft:[-2,0],a:[-2,0],ArrowRight:[2,0],d:[2,0],ArrowUp:[0,-2],w:[0,-2],ArrowDown:[0,2],s:[0,2]};if(d[e.key]){e.preventDefault();move(...d[e.key]);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[blocked]);
  useEffect(()=>{if(!blocked)return;const active=document.activeElement as HTMLElement|null;const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setPanel(null);setHouse(null);}if(e.key==='Tab'){const nodes=Array.from(root.current?.querySelectorAll<HTMLElement>('.megapolis-dialog button,.megapolis-dialog input,.megapolis-dialog a,.megapolis-dialog select')??[]).filter(n=>!n.hasAttribute('disabled')&&n.getClientRects().length);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(document.activeElement===first||!nodes.includes(document.activeElement as HTMLElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!nodes.includes(document.activeElement as HTMLElement))){e.preventDefault();first.focus();}}};root.current?.querySelector<HTMLElement>('.megapolis-dialog button')?.focus();window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);active?.focus();};},[blocked,house,panel]);
  const matches=cityHouses.filter(h=>`${h.title} ${h.label}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <section ref={root} className={`megapolis${motion?' megapolis-motion':''}`} aria-label="MERGE MEGAPOLIS ქალაქი-მუზეუმი">
    <div className="megapolis-world" style={{transform:`scale(${position.zoom})`,transformOrigin:`${position.x}% ${position.y}%`}} onPointerDown={e=>{if(blocked||e.button!==0||(e.target as HTMLElement).closest('button'))return;drag.current={x:e.clientX,y:e.clientY,px:position.x,py:position.y};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const d=drag.current;if(!d)return;setPosition(p=>({...p,zoom:Math.max(p.zoom,1.12),x:clamp(d.px-(e.clientX-d.x)*.06,25,75),y:clamp(d.py-(e.clientY-d.y)*.06,35,65)}));}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
      <img className="megapolis-reference" src="/living-museum/assets/founder-futuristic-grand-museum.png" alt="MERGE Grand Living Museum: ფუტურისტული სასახლე, ოქროსა და ვერცხლის ექსპონატები, მცურავი კუნძულები და ჩანჩქერები" draggable={false}/>
      <div className="megapolis-markers" inert={blocked}>
        {cityHouses.slice(0,7).map(h=><button key={h.id} className="megapolis-marker" style={{left:`${h.x}%`,top:`${h.y}%`}} onClick={()=>openHouse(h)} aria-label={`${h.title} — შესვლა`} title={h.title}><ArrowUp size={18}/><span>{h.title}</span></button>)}
        <button className="megapolis-marker megapolis-palace" style={{left:'55%',top:'52%'}} onClick={onMuseum} title="GRAND MUSEUM" aria-label="GRAND MUSEUM — შესვლა"><ArrowUp size={20}/><span>GRAND MUSEUM</span></button>
      </div>
    </div>
    <header className="megapolis-header" inert={blocked}><Link to="/" className="megapolis-brand" aria-label="MERGE მთავარი"><MergeMasterLogo/></Link><div className="megapolis-place"><span>MERGE MEGAPOLIS</span><small>ქალაქი-მუზეუმი</small></div><Link className="megapolis-site-link" to="/classic">MERGE STARS</Link><Link className="megapolis-account" to={signedIn ? "/dashboard" : "/login"}>პირადი სივრცე</Link></header>
    <div className="megapolis-location" inert={blocked}><Compass size={18}/><span>THE GRAND BOULEVARD<small>01 / MERGE MEGAPOLIS</small></span></div>
    <footer className="megapolis-controls" inert={blocked}>
      <button className="megapolis-chat" onClick={()=>setPanel('chat')}><MessageCircle size={19}/><span>CHAT <small>კავშირი მოლოდინშია</small></span></button>
      <nav className="megapolis-direction" aria-label="ბულვარის ხედის გადაადგილება"><button title="მარცხნივ" aria-label="ქალაქის ხედის მარცხნივ გადაადგილება" onClick={()=>move(-3,0)}><ArrowLeft size={18}/></button><button title="წინ" aria-label="ქალაქის ხედში წინ გადაადგილება" onClick={()=>move(0,-3)}><ArrowUp size={20}/></button><button title="უკან" aria-label="ქალაქის ხედში უკან გადაადგილება" onClick={()=>move(0,3)}><ArrowDown size={18}/></button><button title="მარჯვნივ" aria-label="ქალაქის ხედის მარჯვნივ გადაადგილება" onClick={()=>move(3,0)}><ArrowRight size={18}/></button></nav>
      <nav className="megapolis-tools" aria-label="ქალაქის ხელსაწყოები"><button title="HOUSE რუკა" aria-label="HOUSE რუკის გახსნა" onClick={()=>setPanel('map')}><Map size={22}/></button><button title="კოლექციები" aria-label="CORE კოლექციების გახსნა" onClick={onCatalog}><Search size={21}/></button><button title="ხედის პარამეტრები" aria-label="ხედის პარამეტრების გახსნა" onClick={()=>setPanel('settings')}><Settings2 size={21}/></button><button title={full?'სრული ეკრანის დახურვა':'სრული ეკრანი'} aria-label="ქალაქის სრული ეკრანის გადართვა" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen();else void root.current?.requestFullscreen().catch(()=>{});}}><Expand size={20}/></button></nav>
    </footer>
    {(panel||house)&&<div className="megapolis-backdrop" onClick={e=>{if(e.target===e.currentTarget){setPanel(null);setHouse(null);}}}><section className={`megapolis-dialog${catalog?' megapolis-catalog':''}`} role="dialog" aria-modal="true" aria-labelledby="megapolis-dialog-title"><button className="megapolis-close" aria-label="ქალაქის იმავე ხედზე დაბრუნება" title="დახურვა" onClick={()=>{setPanel(null);setHouse(null);}}><X size={22}/></button>
      <span className="megapolis-kicker">MERGE MEGAPOLIS</span><h2 id="megapolis-dialog-title">{house?.title??(panel==='map'?'HOUSE DIRECTORY':panel==='settings'?'ხედის პარამეტრები':'MERGE COMMUNITY')}</h2>
      {house?<><p>{house.label}</p>{catalog?<><button className="megapolis-text-button" onClick={()=>setCatalog(false)}><ArrowLeft size={16}/>HOUSE-ში დაბრუნება</button><CoreCatalogBrowser category={house.category}/></>:<><div className="megapolis-subcategories">{house.items.map(item=><span key={item}>{item}</span>)}</div><button className="megapolis-primary" onClick={()=>setCatalog(true)}>ყველა ბრენდის ხელმისაწვდომი ნივთები<ArrowRight size={18}/></button>{house.id==='fashion'&&<div className="megapolis-related">{cityHouses.filter(h=>['watch','eyewear','jewelry'].includes(h.id)).map(h=><button key={h.id} onClick={()=>openHouse(h)}>{h.title}<ArrowUp size={15}/></button>)}</div>}<p className="megapolis-note">ქვეკატეგორიების ზუსტი ფილტრაცია CORE-ის შესაბამის ჩანაწერებს საჭიროებს.</p></>}</>:panel==='map'?<><label className="megapolis-search"><Search size={17}/><input aria-label="HOUSE-ის ძებნა" placeholder="მოძებნე HOUSE" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="megapolis-directory"><button onClick={onMuseum}><span><strong>GRAND MUSEUM</strong><small>ექსპონატები და 3D ვიტრინები</small></span><ArrowRight size={18}/></button>{matches.map((h,i)=><button key={h.id} onClick={()=>openHouse(h)}><span className="megapolis-house-number">{String(i+1).padStart(2,'0')}</span><span><strong>{h.title}</strong><small>{h.label}</small></span><ArrowRight size={18}/></button>)}</div>{!matches.length&&<p>HOUSE ვერ მოიძებნა.</p>}</>:panel==='settings'?<><div className="megapolis-setting"><span>მიახლოება</span><button aria-label="ქალაქის ხედის დაშორება" onClick={()=>setPosition(p=>({...p,zoom:clamp(p.zoom-.1,1,1.7)}))}><Minus size={18}/></button><output>{Math.round(position.zoom*100)}%</output><button aria-label="ქალაქის ხედის მოახლოება" onClick={()=>setPosition(p=>({...p,zoom:clamp(p.zoom+.1,1,1.7)}))}><Plus size={18}/></button></div><label className="megapolis-setting">რბილი გადასვლები<input type="checkbox" checked={motion} onChange={e=>setMotion(e.target.checked)}/></label><button className="megapolis-text-button" onClick={()=>setPosition({x:50,y:52,zoom:1})}><RotateCcw size={17}/>საწყისი ხედის აღდგენა</button></>:<><p>ჩატი ჯერ არ არის დაკავშირებული CORE-ის საერთო იდენტობასა და შეტყობინებების სერვისთან.</p><div className="megapolis-pending"><MessageCircle size={22}/><span>CONNECTION PENDING</span></div></>}
    </section></div>}
  </section>;
}
