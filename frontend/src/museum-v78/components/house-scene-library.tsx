'use client';
import {useEffect,useRef,useState} from 'react';
import {CloudDownload,Save,RefreshCw} from 'lucide-react';
import {loadHouseScenes,persistHouseScene} from '@/museum-v78/lib/house-scene-client';
import type {HouseSceneInput,HouseSceneVersion} from '@/museum-v78/lib/house-scene-contract';
import type {HouseLayout} from '@/museum-v78/lib/world-layout';

export function HouseSceneLibrary({layout,activeVersionId,signedIn,onRestore,onSaved}:{layout:HouseLayout;activeVersionId:string|null;signedIn:boolean;onRestore:(value:HouseSceneVersion)=>void;onSaved:(value:HouseSceneVersion)=>void}){
  const [versions,setVersions]=useState<HouseSceneVersion[]>([]),[state,setState]=useState<'LOADING'|'READY'|'SAVING'|'ERROR'>(signedIn?'LOADING':'READY'),[message,setMessage]=useState('');
  const pending=useRef<HouseSceneInput|null>(null),controllers=useRef(new Set<AbortController>()),alive=useRef(false),busy=useRef(false);
  async function reload(){if(!signedIn||busy.current)return;const abort=new AbortController();controllers.current.add(abort);setState('LOADING');try{const list=await loadHouseScenes(abort.signal);if(alive.current){setVersions(list);setState('READY');setMessage('');}}catch{if(alive.current&&!abort.signal.aborted){setState('ERROR');setMessage('Saved scenes could not be loaded. Your current layout is still here.');}}finally{controllers.current.delete(abort);}}
  useEffect(()=>{alive.current=true;void reload();return()=>{alive.current=false;controllers.current.forEach(c=>c.abort());controllers.current.clear();};},[signedIn]);
  async function save(){
    if(!signedIn||busy.current)return;busy.current=true;
    const source={parent_version_id:activeVersionId,layout},key=JSON.stringify(source);
    if(!pending.current||JSON.stringify({parent_version_id:pending.current.parent_version_id,layout:pending.current.layout})!==key)pending.current={request_id:crypto.randomUUID(),...structuredClone(source)};
    const input=pending.current,abort=new AbortController();controllers.current.add(abort);setState('SAVING');setMessage('');
    try{const saved=await persistHouseScene(input,abort.signal);if(!alive.current)return;setVersions(v=>[saved,...v.filter(old=>old.id!==saved.id)].sort((a,b)=>b.created_at.localeCompare(a.created_at)||b.id.localeCompare(a.id)));pending.current=null;setState('READY');onSaved(saved);setMessage('Private scene version saved. You can restore it on your next visit.');}
    catch(error){if(alive.current&&!abort.signal.aborted){setState('ERROR');setMessage(error instanceof Error&&error.message==='SCENE_VERSION_LIMIT'?'Your 80-version limit has been reached. Export the layout file to keep further studies.':error instanceof Error&&error.message==='AUTH_REQUIRED'?'Sign in again to save. Your current layout has been kept.':'Save was not confirmed. Retry keeps the same request, so it cannot create a duplicate.');}}
    finally{controllers.current.delete(abort);busy.current=false;}
  }
  const saving=state==='SAVING';
  return <section className="house-scene-library" aria-label="Private House scene versions">
    <h5>Private scene versions</h5><p>Save your architecture, lighting, mosaic and display arrangement. This creates a private study, without changing your CORE House.</p>
    <button className="world-primary" type="button" disabled={!signedIn||saving||state==='LOADING'} onClick={()=>void save()}><Save size={15}/>{saving?'Saving…':'Save private scene version'}</button>
    {!signedIn&&<p>Sign in to keep scene versions between visits. You can still export a layout file.</p>}
    {signedIn&&<button className="world-secondary" type="button" disabled={saving||state==='LOADING'} onClick={()=>void reload()}><RefreshCw size={14}/>{state==='LOADING'?'Loading versions…':'Refresh saved versions'}</button>}
    {versions.length>0&&<ol>{versions.map((version,index)=><li key={version.id}><span><strong>{version.layout.title}</strong><small>{new Date(version.created_at).toLocaleString('en-GB')} · {version.layout.architecture??'PALACE'}{version.parent_version_id?' · branch':''}</small></span><button type="button" disabled={saving} aria-label={'Restore scene version '+(index+1)} aria-pressed={activeVersionId===version.id} onClick={()=>{pending.current=null;onRestore(version);setMessage('Saved private scene restored. You can undo this change or continue as a new branch.');}}><CloudDownload size={15}/>Restore</button></li>)}</ol>}
    {state==='READY'&&signedIn&&versions.length===0&&<p>No saved scene versions yet.</p>}
    {message&&<p role="status">{message}</p>}
  </section>;
}
