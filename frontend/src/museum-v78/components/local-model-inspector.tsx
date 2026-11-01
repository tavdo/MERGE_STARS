"use client";
import {useEffect,useRef,useState} from 'react';
import {Box,RotateCcw,RotateCw,Plus,Minus,Upload,X} from 'lucide-react';
import {inspectCoreGLB} from '@/museum-v78/lib/core-gltf';
import {createMuseumFrameLoop} from '@/museum-v78/lib/museum-frame-loop';
import type {createCoreModelStage} from '@/museum-v78/lib/core-model-scene';

type InspectedFile={name:string;bytes:ArrayBuffer;sha256:string};
const MAX_LOCAL_BYTES=20*1024*1024;
export function LocalModelInspector(){
 const [file,setFile]=useState<InspectedFile|null>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[attempt,setAttempt]=useState(0);
 const canvas=useRef<HTMLCanvasElement>(null),stage=useRef<Awaited<ReturnType<typeof createCoreModelStage>>|null>(null),invalidate=useRef(()=>{}),sequence=useRef(0),drag=useRef<{id:number;x:number;y:number}|null>(null),input=useRef<HTMLInputElement>(null);
 useEffect(()=>()=>{++sequence.current;},[]);
 async function inspect(selected:File|undefined){
  if(!selected)return;const ticket=++sequence.current;setMessage('');setFile(null);setBusy(true);
  try{
   if(!/\.glb$/i.test(selected.name)||selected.size<20||selected.size>MAX_LOCAL_BYTES)throw Error('Choose a self-contained GLB 2.0 file up to 20 MB.');
   const bytes=await selected.arrayBuffer();inspectCoreGLB(bytes);
   const digest=await crypto.subtle.digest('SHA-256',bytes),sha256=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
   if(ticket===sequence.current)setFile({name:selected.name,bytes,sha256});
  }catch(error){if(ticket===sequence.current)setMessage(error instanceof Error&&error.message.startsWith('Choose')?error.message:'This file is invalid, uses external resources or needs an unsupported decoder. Export an embedded GLB 2.0 file.');}
  finally{if(ticket===sequence.current)setBusy(false);}
 }
 useEffect(()=>{
  if(!file||!canvas.current)return;const element=canvas.current,controller=new AbortController();let active=true;setReady(false);
  const loop=createMuseumFrameLoop(()=>{if(active&&!document.hidden)stage.current?.render();return false;});invalidate.current=loop.invalidate;
  const resize=new ResizeObserver(loop.invalidate);resize.observe(element);
  const lost=(event:Event)=>{event.preventDefault();setReady(false);setMessage('The graphics context was lost. Your selected file is retained; retry the preview.');};element.addEventListener('webglcontextlost',lost);
  void import('@/museum-v78/lib/core-model-scene').then(runtime=>runtime.createCoreModelStage(element,file.bytes,controller.signal)).then(value=>{if(!active||controller.signal.aborted){value.dispose();return;}stage.current=value;setMessage('');setReady(true);loop.invalidate();}).catch(()=>{if(active)setMessage('3D preview is unavailable on this device or this model needs a supported decoder. The file has not been uploaded.');});
  return()=>{active=false;controller.abort();loop.dispose();resize.disconnect();element.removeEventListener('webglcontextlost',lost);stage.current?.dispose();stage.current=null;invalidate.current=()=>{};};
 },[file,attempt]);
 function orbit(delta:number){if(stage.current)stage.current.orbit.yaw+=delta;invalidate.current();}
 function zoom(delta:number){if(stage.current)stage.current.orbit.distance=Math.max(2.3,Math.min(9,stage.current.orbit.distance+delta));invalidate.current();}
 return <section className="local-model-inspector" aria-label="Inspect an existing 3D design">
  <span className="eyebrow">YOUR EXISTING DESIGN · PRIVATE LOCAL PREVIEW</span><h3>Bring your own 3D model</h3>
  <p>Open a self-contained GLB model, inspect it in 3D and prepare its design brief. The file stays on this device. CORE import and publication require the existing authorized asset service.</p>
  <input ref={input} type="file" accept=".glb,model/gltf-binary" disabled={busy} aria-label="Choose a GLB model up to 20 MB" onChange={event=>void inspect(event.target.files?.[0])}/>
  {busy&&<p role="status">Inspecting model format, embedded resources and file fingerprint…</p>}
  {file&&<><div className="local-model-stage"><canvas ref={canvas} aria-label="Local model; drag to rotate" onPointerDown={event=>{if(!ready||event.button!==0)return;drag.current={id:event.pointerId,x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={event=>{const d=drag.current;if(!d||d.id!==event.pointerId||!stage.current||!ready)return;stage.current.orbit.yaw+=(event.clientX-d.x)*.008;stage.current.orbit.pitch=Math.max(-1,Math.min(1,stage.current.orbit.pitch+(event.clientY-d.y)*.006));d.x=event.clientX;d.y=event.clientY;invalidate.current();}} onPointerUp={event=>{drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}/><span>{ready?'LOCAL 3D PREVIEW':'PREPARING LOCAL PREVIEW'}</span></div>
   <div className="studio-actions"><button type="button" disabled={!ready} aria-label="Rotate model left" onClick={()=>orbit(-Math.PI/8)}><RotateCcw size={17}/></button><button type="button" disabled={!ready} aria-label="Rotate model right" onClick={()=>orbit(Math.PI/8)}><RotateCw size={17}/></button><button type="button" disabled={!ready} aria-label="Zoom in" onClick={()=>zoom(-.35)}><Plus size={17}/></button><button type="button" disabled={!ready} aria-label="Zoom out" onClick={()=>zoom(.35)}><Minus size={17}/></button><button type="button" disabled={!ready} onClick={()=>{stage.current?.reset();invalidate.current();}}>Reset view</button><button type="button" onClick={()=>{++sequence.current;setFile(null);setMessage('');setReady(false);if(input.current)input.current.value='';}}><X size={17}/>Remove local file</button></div>
   <dl><div><dt>File</dt><dd>{file.name}</dd></div><div><dt>SHA-256</dt><dd><code>{file.sha256}</code></dd></div><div><dt>CORE Product / Version ID</dt><dd>Not assigned</dd></div></dl>
  </>}
  {message&&<div role="status"><p>{message}</p>{file&&!ready&&<button type="button" onClick={()=>setAttempt(v=>v+1)}>Retry preview</button>}</div>}
  <button type="button" disabled title="Authorized CORE asset import is not connected"><Upload size={17}/>Import to CORE · connection required</button><p className="fine-note"><Box size={14}/> A model preview does not verify dimensions, material, weight, rights or manufacturing readiness.</p>
 </section>;
}
