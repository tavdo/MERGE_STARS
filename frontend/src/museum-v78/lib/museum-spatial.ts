import type { MuseumPointId } from './museum-tour';
import {exhibitionShape,exhibitionFacing} from './museum-interior.ts';
// These units belong exclusively to the exhibition scene. They are NEVER physical product units.
export type Vec3 = readonly [number, number, number];
export type SpatialCamera = { position: Vec3; yaw: number; pitch: number; fov: number; framing?:'OBJECT'; focus?:number; displayBounds?:readonly [number,number] };
export type SpatialNodeId = 'entry' | 'crossroads' | 'center' | 'aurum' | 'argentum' | 'west' | 'east' | 'north' | 'west-gallery' | 'east-gallery';
export type SpatialExhibit = { id: MuseumPointId; title: string; category: string; position: Vec3; node: SpatialNodeId; image: string; crop?: readonly [number,number,number,number]; conceptReference: string | null; displayScale: 'EXHIBITION_ONLY'; modelStatus: 'VIEW_ONLY' };
const approved='/museum-v78/assets/approved-mega-museum.png';
const exhibit=(id:MuseumPointId,title:string,category:string,x:number,z:number,node:SpatialNodeId,crop:readonly [number,number,number,number],reference:string|null=null,image=approved):SpatialExhibit=>({id,title,category,position:[x,.48+exhibitionShape(id,crop).h/2,z],node,image,crop,conceptReference:reference,displayScale:'EXHIBITION_ONLY',modelStatus:'VIEW_ONLY'});
export const spatialExhibits: readonly SpatialExhibit[] = Object.freeze([
 exhibit('art','ხელოვნება','ART',-11,-5,'aurum',[.06,.354,.163,.508]),
 exhibit('music','მუსიკა','MUSIC',-9,-7,'aurum',[.155,.347,.274,.485]),
 exhibit('furniture','ავეჯი','FURNITURE',-3.8,-5,'center',[.284,.424,.397,.49]),
 exhibit('fashion','მოდა','FASHION',-1.8,-3,'center',[.415,.39,.565,.612]),
 exhibit('automotive','ავტომობილი','AUTOMOTIVE',4.3,-5.5,'argentum',[.584,.421,.704,.5]),
 exhibit('motorcycles','მოტოციკლები','MOTORCYCLES',9,-6.5,'argentum',[.715,.417,.792,.498]),
 exhibit('architecture','არქიტექტურა','ARCHITECTURE',11.8,-5,'argentum',[.813,.376,.89,.522]),
 exhibit('jewelry','სამკაული','JEWELRY',-12,3,'west',[.079,.559,.166,.666]),
 exhibit('watches','საათი','WATCHES',-10.2,5.1,'west',[.162,.584,.231,.682]),
 exhibit('eyewear','მოზაიკის სათვალე','EYEWEAR',-4.3,4.6,'crossroads',[.135,.175,.792,.448],'MERGE-EYE-001','/museum-v78/assets/eyewear.png'),
 exhibit('bags','ჩანთები','BAGS',-2.2,2,'crossroads',[.316,.591,.404,.695]),
 exhibit('shoes','ფეხსაცმელი','SHOES',3.6,4,'east',[.57,.571,.641,.683]),
 exhibit('stationery','კანცელარია','STATIONERY',6.5,4,'east',[.648,.595,.713,.687]),
 exhibit('collectibles','საკოლექციო ნიმუში','COLLECTIBLES',9.4,3.2,'east',[.714,.592,.763,.69]),
 exhibit('decor','ინტერიერი და განათება','INTERIOR',12.5,2,'east',[.766,.583,.813,.69]),
 exhibit('mosaic','მოზაიკა','MOSAIC',12,-10,'east-gallery',[.81,.582,.879,.69]),
 exhibit('technology','ტექნოლოგია','TECHNOLOGY',-12,-10,'west-gallery',[.475,.877,.527,.925]),
 exhibit('case','MERGE COIN · მრგვალი ფუტლარი','MERGE COIN',0,-10.5,'north',[0,0,1,1],'MERGE-CASE-001','/museum-v78/assets/coin-case.png'),
].map(x=>Object.freeze({...x,position:Object.freeze(x.position)})));
export type SpatialNode = { id:SpatialNodeId; title:string; scene_position:Vec3; camera_position:Vec3; camera_orientation:readonly [number,number]; connected_nodes:readonly SpatialNodeId[]; nearby_exhibits:readonly MuseumPointId[] };
function node(id:SpatialNodeId,title:string,x:number,z:number,connections:SpatialNodeId[]):SpatialNode{return Object.freeze({id,title,scene_position:Object.freeze([x,0,z]) as Vec3,camera_position:Object.freeze([x,2.2,z]) as Vec3,camera_orientation:Object.freeze([0,-.07]) as readonly [number,number],connected_nodes:Object.freeze(connections),nearby_exhibits:Object.freeze(spatialExhibits.filter(e=>e.node===id).map(e=>e.id))});}
export const spatialNodes:readonly SpatialNode[]=Object.freeze([
 node('entry','მთავარი შესასვლელი',0,13,['crossroads']),
 node('crossroads','აღმოჩენების გზა',0,7,['entry','west','east','center']),
 node('center','ცენტრალური დარბაზი',0,0,['crossroads','aurum','argentum','north']),
 node('west','მარცხენა ვიტრინები',-8,7,['crossroads','aurum']),
 node('east','მარჯვენა ვიტრინები',8,7,['crossroads','argentum']),
 node('aurum','AURUM · ოქროს დარბაზი',-7,-1,['west','center','west-gallery']),
 node('argentum','ARGENTUM · ვერცხლის დარბაზი',7,-1,['east','center','east-gallery']),
 node('north','MERGE COIN · გალერეა',0,-7,['center','west-gallery','east-gallery']),
 node('west-gallery','AURUM · შიდა გალერეა',-7,-10,['aurum','north']),
 node('east-gallery','ARGENTUM · შიდა გალერეა',7,-10,['argentum','north']),
]);
export const nodeById=(id:SpatialNodeId):SpatialNode=>{const n=spatialNodes.find(n=>n.id===id);if(!n)throw Error('Unknown spatial node');return n;};
export const exhibitById=(id:MuseumPointId):SpatialExhibit=>{const e=spatialExhibits.find(e=>e.id===id);if(!e)throw Error('Unknown spatial exhibit');return e;};
export const cameraAt=(id:SpatialNodeId):SpatialCamera=>{const n=nodeById(id);return {position:[...n.camera_position],yaw:n.camera_orientation[0],pitch:n.camera_orientation[1],fov:65};};
export type SpatialJourney={node:SpatialNodeId;camera:SpatialCamera;selected:MuseumPointId|null;visited:readonly SpatialNodeId[];discovered:readonly MuseumPointId[];back:readonly SpatialNodeId[];returnCamera:SpatialCamera|null};
const cloneCamera=(c:SpatialCamera):SpatialCamera=>({...c,position:[...c.position]});
export function enterSpatialMuseum():SpatialJourney{return {node:'entry',camera:cameraAt('entry'),selected:null,visited:['entry'],discovered:[],back:[],returnCamera:null};}
export function walkSpatial(j:SpatialJourney,to:SpatialNodeId):SpatialJourney{
 if(j.selected || !nodeById(j.node).connected_nodes.includes(to))throw Error('Unconnected or blocked route');
 const n=nodeById(to);return {...j,node:to,camera:cameraAt(to),visited:[...new Set([...j.visited,to])],discovered:[...new Set([...j.discovered,...n.nearby_exhibits])],back:[...j.back,j.node],returnCamera:null};
}
export function stepBackSpatial(j:SpatialJourney):SpatialJourney{
 if(j.selected||!j.back.length)throw Error('No previous position');const target=j.back.at(-1)!;
 const next=walkSpatial(j,target);return {...next,back:j.back.slice(0,-1)};
}
export function approachSpatial(j:SpatialJourney,id:MuseumPointId):SpatialJourney{
 const e=exhibitById(id);if(j.selected||e.node!==j.node)throw Error('Approach requires the nearby exhibition node');
 const facing=exhibitionFacing(e.position[0],e.position[2],e.id);
 const position:Vec3=[e.position[0]+Math.sin(facing)*3.35,Math.max(1.7,e.position[1]+.25),e.position[2]+Math.cos(facing)*3.35];
 const yaw=Math.atan2(e.position[0]-position[0],-(e.position[2]-position[2]));
 const size=exhibitionShape(e.id,e.crop??[0,0,1,1]);
 return {...j,selected:id,returnCamera:cloneCamera(j.camera),camera:{position,yaw,pitch:Math.atan2(e.position[1]-position[1],3.35),fov:46,framing:'OBJECT',focus:1,displayBounds:[size.w,size.h]},discovered:[...new Set([...j.discovered,id])]};
}
export function closeSpatial(j:SpatialJourney):SpatialJourney{if(!j.selected)return j;if(!j.returnCamera)throw Error('Missing spatial return snapshot');return {...j,selected:null,camera:cloneCamera(j.returnCamera),returnCamera:null};}
export function lookSpatial(c:SpatialCamera,dx:number,dy:number):SpatialCamera{if(![dx,dy].every(Number.isFinite))throw Error('Invalid look');return {...cloneCamera(c),yaw:c.yaw-dx*.004,pitch:Math.max(-.55,Math.min(.55,c.pitch+dy*.003))};}
export function interpolateCamera(a:SpatialCamera,b:SpatialCamera,t:number):SpatialCamera{
 const u=Math.max(0,Math.min(1,t)),s=u*u*(3-2*u),angle=Math.atan2(Math.sin(b.yaw-a.yaw),Math.cos(b.yaw-a.yaw));
 return {position:a.position.map((v,i)=>v+(b.position[i]-v)*s) as unknown as Vec3,yaw:a.yaw+angle*s,pitch:a.pitch+(b.pitch-a.pitch)*s,fov:a.fov+(b.fov-a.fov)*s,...(a.focus!==undefined||b.focus!==undefined?{focus:(a.focus??0)+((b.focus??0)-(a.focus??0))*s}:{}),...(b.displayBounds||a.displayBounds?{displayBounds:b.displayBounds??a.displayBounds}:{}),...(b.framing?{framing:b.framing}:{})};
}
export function cameraBasis(c:SpatialCamera){const y=c.yaw,p=c.pitch;return {forward:[Math.sin(y)*Math.cos(p),Math.sin(p),-Math.cos(y)*Math.cos(p)] as Vec3,right:[Math.cos(y),0,Math.sin(y)] as Vec3,up:[-Math.sin(y)*Math.sin(p),Math.cos(p),Math.cos(y)*Math.sin(p)] as Vec3};}
export function projectSpatial(position:Vec3,c:SpatialCamera,aspect:number,lensShift=0,lensLift=0):{x:number;y:number;depth:number}|null{
 const b=cameraBasis(c),r=position.map((v,i)=>v-c.position[i]),dot=(v:Vec3)=>v.reduce((s,n,i)=>s+n*r[i],0),depth=dot(b.forward),tan=Math.tan(c.fov*Math.PI/360);
 if(depth<.2)return null;const x=50+dot(b.right)/(depth*tan*aspect)*50+lensShift*50,y=50-dot(b.up)/(depth*tan)*50-lensLift*50;
 return x>0&&x<100&&y>0&&y<100?{x,y,depth}:null;
}
export function routeSpatial(from:SpatialNodeId,to:SpatialNodeId):SpatialNodeId[]{
 nodeById(to);const queue:SpatialNodeId[][]=[[from]],seen=new Set([from]);
 for(const path of queue){const last=path.at(-1)!;if(last===to)return path.slice(1);for(const id of nodeById(last).connected_nodes)if(!seen.has(id)){seen.add(id);queue.push([...path,id]);}}
 throw Error('No connected route');
}
// Status is about a successfully parsed asset, never the presence of an image/URL or a job request.
export function objectAssetStatus(input:{parsed3d:boolean;jobState?:string}):'VIEW ONLY'|'3D READY'|'GENERATING'|'QUEUED'|'FAILED'{if(input.parsed3d)return '3D READY';if(['QUEUED','GENERATING','FAILED'].includes(input.jobState??''))return input.jobState as 'QUEUED'|'GENERATING'|'FAILED';return 'VIEW ONLY';}
