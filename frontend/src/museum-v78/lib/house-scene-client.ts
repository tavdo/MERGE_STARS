import { museumV78Fetch } from '@/museum-v78/transport';
import {houseSceneInputSchema,houseSceneListSchema,houseSceneSavedSchema,type HouseSceneInput} from './house-scene-contract';

async function readHouseSceneResponse(input:HouseSceneInput|null,signal?:AbortSignal){
  const response=await museumV78Fetch('/api/house-scenes',{method:input?'POST':'GET',credentials:'same-origin',cache:'no-store',redirect:'error',signal,headers:{Accept:'application/json',...(input?{'Content-Type':'application/json'}:{})},...(input?{body:JSON.stringify(houseSceneInputSchema.parse(input))}:{})});
  if(!response.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw Error('SCENE_RESPONSE_INVALID');
  const reader=response.body?.getReader();if(!reader)throw Error('SCENE_RESPONSE_INVALID');
  const chunks:Uint8Array[]=[];let size=0;
  try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>512*1024){await reader.cancel();throw Error('SCENE_RESPONSE_INVALID');}chunks.push(part.value);}}finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let data:unknown;try{data=JSON.parse(new TextDecoder().decode(bytes));}catch{throw Error('SCENE_RESPONSE_INVALID');}
  if(!response.ok){const code=(data as {error?:unknown})?.error;throw Error(typeof code==='string'&&['AUTH_REQUIRED','IDEMPOTENCY_CONFLICT','INVALID_SCENE_PARENT','SCENE_VERSION_LIMIT','SCENE_STORAGE_UNAVAILABLE'].includes(code)?code:'SCENE_STORAGE_UNAVAILABLE');}
  return data;
}
async function requestHouseScenes(input:HouseSceneInput|null,signal?:AbortSignal){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000),abort=()=>controller.abort();
  if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
  try{return await readHouseSceneResponse(input,controller.signal);}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
export async function loadHouseScenes(signal?:AbortSignal){const result=houseSceneListSchema.parse(await requestHouseScenes(null,signal));if(new Set(result.versions.map(v=>v.id)).size!==result.versions.length)throw Error('SCENE_RESPONSE_INVALID');return result.versions;}
export async function persistHouseScene(input:HouseSceneInput,signal?:AbortSignal){
  const canonical=houseSceneInputSchema.parse(input),result=houseSceneSavedSchema.parse(await requestHouseScenes(canonical,signal));
  if(result.version.parent_version_id!==canonical.parent_version_id||JSON.stringify(result.version.layout)!==JSON.stringify(canonical.layout))throw Error('SCENE_RESPONSE_INVALID');
  return result.version;
}
