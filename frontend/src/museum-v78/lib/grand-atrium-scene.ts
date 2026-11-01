import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {cityHouses} from './megapolis-domain';
import {clockDisplayPosition,defaultHouseLayout,type HouseLayout,type LiftState} from './world-layout';
import {zodiacStudies,type WorldTab} from './unified-world';

export const clockSlot=clockDisplayPosition;
export type AtriumView={tab:WorldTab;layout:HouseLayout;selected:number|null;angle:number;distance:number;lift:LiftState;preview:boolean};
export type AtriumPick={kind:'industry'|'display'|'zodiac';index:number};

// Bounded exhibition architecture. Only CORE can supply commercial exhibits.
export function buildGrandAtrium(){
 const root=new THREE.Group(),gold=new THREE.MeshStandardMaterial({color:'#bc9151',metalness:.88,roughness:.25}),stone=new THREE.MeshStandardMaterial({color:'#171c20',metalness:.3,roughness:.3}),silver=new THREE.MeshStandardMaterial({color:'#c2d0d5',metalness:.87,roughness:.23}),glass=new THREE.MeshPhysicalMaterial({color:'#bfd2ce',transparent:true,opacity:.12,roughness:.08,depthWrite:false,side:THREE.DoubleSide});
 const glow=new THREE.MeshBasicMaterial({color:'#ffe5ad'}),slots:THREE.Group[]=[],portals:THREE.Group[]=[],sculptures:THREE.Group[]=[],pickables:THREE.Object3D[]=[],labels:THREE.CanvasTexture[]=[];
 function mesh(parent:THREE.Object3D,g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;}
 function cylinder(parent:THREE.Group,r:number,h:number,y:number,m:THREE.Material){return mesh(parent,new THREE.CylinderGeometry(r,r,h,32),m,0,y);}
 function ring(parent:THREE.Group,r:number,y:number,m:THREE.Material,t=.045){const o=mesh(parent,new THREE.TorusGeometry(r,t,6,64),m,0,y);o.rotation.x=Math.PI/2;return o;}
 function label(parent:THREE.Group,text:string,y:number,width=3.5){
  if(typeof document==='undefined')return;const canvas=document.createElement('canvas');canvas.width=768;canvas.height=112;const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.clearRect(0,0,768,112);ctx.fillStyle='#f0dfb5';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 30px Georgia';ctx.fillText(text,384,56,740);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;labels.push(map);const o=mesh(parent,new THREE.PlaneGeometry(width,width*112/768),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:THREE.DoubleSide}),0,y);o.position.z=.28;
 }
 cylinder(root,20,.32,-.2,stone);ring(root,19.4,.01,gold,.1);ring(root,10,.01,silver);ring(root,5,.01,gold);
 const upper=mesh(root,new THREE.RingGeometry(5.5,19.8,80),stone,0,8);upper.rotation.x=-Math.PI/2;upper.material.side=THREE.DoubleSide;
 ring(root,5.5,8.12,gold,.09);ring(root,19.5,8.12,gold,.09);
 mesh(root,new THREE.CylinderGeometry(5.5,5.5,1.1,64,1,true),glass,0,8.7).name='Upper gallery safety balustrade';ring(root,5.5,9.25,gold);
 for(let i=0;i<24;i++){const a=i*Math.PI/12,c=cylinder(root,.16,18,9,i%2?gold:silver);c.position.set(Math.sin(a)*19.4,9,-Math.cos(a)*19.4);const cap=cylinder(root,.3,.12,18,gold);cap.position.x=c.position.x;cap.position.z=c.position.z;}
 for(let i=0;i<12;i++){
  const p=clockSlot(i),slot=new THREE.Group();slot.position.set(p.x,8,p.z);slot.rotation.y=(i+1)*Math.PI/6;slot.name=`DISPLAY ${String(i+1).padStart(2,'0')}`;slot.userData={kind:'display',index:i,core_product_id:null,authoritative:false};
  cylinder(slot,1.45,.25,.13,stone);ring(slot,1.4,.28,gold);cylinder(slot,1.32,3.1,1.95,glass);ring(slot,1.4,3.5,gold,.06);ring(slot,1.3,3.4,glow,.025);cylinder(slot,.65,.6,.6,stone).name='Awaiting authorized CORE exhibit';label(slot,String(i+1).padStart(2,'0'),.5,1.2);slots.push(slot);root.add(slot);
  const target=mesh(slot,new THREE.CylinderGeometry(1.45,1.45,3.5,12),new THREE.MeshBasicMaterial({visible:false}),0,1.75);target.userData=slot.userData;pickables.push(target);
  const portal=new THREE.Group(),a=(i+1)*Math.PI/6;portal.position.set(Math.sin(a)*17.8,0,-Math.cos(a)*17.8);portal.rotation.y=-a;
  mesh(portal,new THREE.BoxGeometry(3.8,5.8,.22),stone,0,2.9);for(const x of [-1.9,1.9])mesh(portal,new THREE.BoxGeometry(.12,5.8,.35),gold,x,2.9);mesh(portal,new THREE.BoxGeometry(4,.13,.35),gold,0,5.8);mesh(portal,new THREE.BoxGeometry(3.5,.025,3.4),gold,0,.015,1.5);label(portal,cityHouses[i].title,4.7,3.45);label(portal,'DISCOVER · CREATE',3.9,2.5);
  const targetPortal=mesh(portal,new THREE.BoxGeometry(3.7,5.6,.45),new THREE.MeshBasicMaterial({visible:false}),0,2.9);targetPortal.userData={kind:'industry',index:i};pickables.push(targetPortal);portals.push(portal);root.add(portal);
  const beam=mesh(root,new THREE.BoxGeometry(.04,.015,10),gold,Math.sin(a)*10,.02,-Math.cos(a)*10);beam.rotation.y=-a;
 }
 const cabin=new THREE.Group();cabin.name='Panoramic elevator';cylinder(cabin,2.7,.25,.18,stone);ring(cabin,2.7,.32,gold,.09);cylinder(cabin,2.7,4.4,2.5,glass);ring(cabin,2.7,4.7,gold,.09);
 const doors=[-1,1].map(side=>{const door=mesh(cabin,new THREE.BoxGeometry(1.5,4,.08),glass,side*.76,2.4,2.72);mesh(door,new THREE.BoxGeometry(.035,4,.1),gold,side*.74);return door;});root.add(cabin);
 for(const x of [-3.1,3.1])mesh(root,new THREE.BoxGeometry(.1,14,.1),gold,x,6);
 const dome=mesh(root,new THREE.SphereGeometry(20,40,18,0,Math.PI*2,0,Math.PI/2),glass,0,19);dome.scale.y=.42;
 const ribs:THREE.Mesh[]=[];
 for(let i=0;i<8;i++){const rib=mesh(root,new THREE.TorusGeometry(20,.045,6,64,Math.PI),gold,0,19);rib.scale.y=.42;rib.rotation.y=i*Math.PI/8;ribs.push(rib);}
 const mosaic=new THREE.InstancedMesh(new THREE.BoxGeometry(.32,.025,.56),gold,240);mosaic.name='Private architectural mosaic study';mosaic.visible=false;root.add(mosaic);
 const zodiac=new THREE.Group();zodiac.name='Zodiac architectural sculpture studies';zodiac.visible=false;
 mesh(zodiac,new THREE.BoxGeometry(17,.3,37),stone,0,-.2);for(const x of [-8,8])mesh(zodiac,new THREE.BoxGeometry(.1,13,37),gold,x,6.5);mesh(zodiac,new THREE.BoxGeometry(17,.1,37),stone,0,13);
 zodiacStudies.forEach((name,i)=>{const group=new THREE.Group(),side=i<6?-1:1;group.position.set(side*5.6,0,12-(i%6)*4.7);cylinder(group,1.2,.3,.15,stone);ring(group,1.15,.33,gold);mesh(group,new THREE.BoxGeometry(.7,1.4,.7),stone,0,1);const sculpture=mesh(group,new THREE.TorusKnotGeometry(.62,.09,64,8,2+(i%3),3+(i%4)),i%2?gold:silver,0,2.9);sculpture.rotation.set(i*.1,i*.27,Math.PI/8);sculpture.name=name+' · abstract study';label(group,name.toUpperCase(),4.25,2.8);group.rotation.y=side<0?Math.PI/2:-Math.PI/2;const target=mesh(group,new THREE.CylinderGeometry(1.25,1.25,4.6,10),new THREE.MeshBasicMaterial({visible:false}),0,2.3);target.userData={kind:'zodiac',index:i};pickables.push(target);sculptures.push(group);zodiac.add(group);});
 return {root,cabin,doors,slots,portals,zodiac,sculptures,pickables,dome,ribs,mosaic,materials:{stone,gold,silver,glow},labels};
}

export function applyAtriumStudy(world:ReturnType<typeof buildGrandAtrium>,layout:HouseLayout,privateHouse:boolean){
 const local=privateHouse?layout:defaultHouseLayout(),height=local.architecture==='PAVILION'?.24:local.architecture==='GARDEN'?.65:.42;
 world.dome.scale.y=height;world.ribs.forEach(rib=>{rib.scale.y=height;});
 world.materials.stone.color.set(local.style==='IVORY'?'#c6c1ae':local.style==='BOTANICAL'?'#183d33':'#171c20');
 world.mosaic.visible=privateHouse;
 const count=local.mosaic==='MICRO'?240:local.mosaic==='FINE'?180:local.mosaic==='MEDIUM'?120:local.mosaic==='LARGE'?60:36;
 const size=local.mosaic==='MICRO'?.5:local.mosaic==='FINE'?.75:local.mosaic==='MEDIUM'?1:local.mosaic==='LARGE'?1.5:2;
 world.mosaic.count=count;
 const tile=new THREE.Object3D();
 for(let i=0;i<count;i++){const angle=i%60*Math.PI*2/60,radius=6.4+Math.floor(i/60)*3.5;tile.position.set(Math.sin(angle)*radius,8.14,-Math.cos(angle)*radius);tile.rotation.y=angle;tile.scale.set(size,1,size);tile.updateMatrix();world.mosaic.setMatrixAt(i,tile.matrix);}
 world.mosaic.instanceMatrix.needsUpdate=true;world.mosaic.computeBoundingSphere();
}

export function createGrandAtriumRenderer(canvas:HTMLCanvasElement,onContextLost:()=>void){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#0d171d');scene.fog=new THREE.Fog('#0d171d',32,90);const world=buildGrandAtrium();scene.add(world.root,world.zodiac);
 const camera=new THREE.PerspectiveCamera(56,1,.1,120);scene.add(new THREE.HemisphereLight('#d5edf0','#54402a',2));const key=new THREE.DirectionalLight('#ffdf9d',4);key.position.set(3,26,8);scene.add(key);const fill=new THREE.DirectionalLight('#a4c7ec',2);fill.position.set(-16,12,-8);scene.add(fill);const light=new THREE.PointLight('#ffe2ab',45,20,2);light.position.set(0,6,0);scene.add(light);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 let disposed=false,lastWidth=0,lastHeight=0,view:AtriumView={tab:'atrium',layout:defaultHouseLayout(),selected:null,angle:0,distance:17,lift:{height:0,door:0,target:0,phase:'IDLE'},preview:false};
 const logoMaterial=new THREE.MeshBasicMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false});const logo=new THREE.Mesh(new THREE.PlaneGeometry(3.2,3.2),logoMaterial);logo.position.set(0,6,-4);world.root.add(logo);
 new THREE.TextureLoader().load('/museum-v78/assets/official-company-logo.svg',texture=>{if(disposed){texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;logoMaterial.map=texture;logoMaterial.needsUpdate=true;if(!renderer.getContext().isContextLost())renderer.render(scene,camera);},undefined,()=>{});
 const lost=(event:Event)=>{event.preventDefault();onContextLost();};canvas.addEventListener('webglcontextlost',lost);const ray=new THREE.Raycaster();
 return {
  render(next:AtriumView){
   if(disposed||renderer.getContext().isContextLost())return;view=next;world.root.visible=next.tab!=='zodiac';world.zodiac.visible=next.tab==='zodiac';
   applyAtriumStudy(world,next.layout,next.tab==='house');
   const lighting=next.tab==='house'?next.layout.lighting:'WARM';key.color.set(lighting==='NEUTRAL'?'#e7f2ff':lighting==='EVENING'?'#b6a2d6':'#ffdf9d');key.intensity=lighting==='EVENING'?2.5:4;
   world.cabin.position.y=next.lift.height;world.doors.forEach((d,i)=>d.position.x=(i===0?-1:1)*(.76+next.lift.door*1.3));
   world.slots.forEach((slot,i)=>{const p=next.tab==='house'?next.layout.pieces.find(p=>p.slot===i)!:{...clockSlot(i),rotation:(i+1)*30};slot.position.set(p.x,8,p.z);slot.rotation.y=p.rotation*Math.PI/180;slot.scale.setScalar(next.selected===i&&next.tab!=='zodiac'?1.07:1);});
   const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);if(width!==lastWidth||height!==lastHeight){lastWidth=width;lastHeight=height;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
   if(next.tab==='zodiac'){const chosen=next.selected!==null?world.sculptures[next.selected]:null;if(chosen){camera.position.set(0,3.3,chosen.position.z+2.3);camera.lookAt(chosen.position.x,2.8,chosen.position.z);}else{camera.position.set(Math.sin(next.angle)*1.5,3.3,18);camera.lookAt(Math.sin(next.angle)*4,3,-12);}}
   else if(next.preview){camera.position.set(Math.sin(next.angle)*26,24,Math.cos(next.angle)*26);camera.lookAt(0,7,0);}
   else if(next.lift.phase!=='IDLE'){camera.position.set(.3,2.3+next.lift.height,1.2);camera.lookAt(Math.sin(next.angle)*12,3+next.lift.height,16);}
   else if(next.selected!==null&&next.tab!=='atrium'){const p=world.slots[next.selected].position;camera.position.set(p.x*.64,10.5,p.z*.64);camera.lookAt(p.x,10,p.z);}
   else{const y=next.tab==='atrium'?4.8+next.lift.height:12.8;camera.position.set(Math.sin(next.angle)*next.distance,y,Math.cos(next.angle)*next.distance);camera.lookAt(0,y-.2,0);}
   renderer.render(scene,camera);
  },
  pick(x:number,y:number):AtriumPick|null{const rect=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1),camera);for(const hit of ray.intersectObjects(world.pickables,false)){if(view.tab==='zodiac'&&hit.object.userData.kind!=='zodiac'||view.tab!=='zodiac'&&hit.object.userData.kind==='zodiac')continue;if(view.tab==='atrium'&&view.lift.height<4&&hit.object.userData.kind==='display')continue;return hit.object.userData as AtriumPick;}return null;},
  dispose(){disposed=true;canvas.removeEventListener('webglcontextlost',lost);const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());world.labels.forEach(t=>t.dispose());logoMaterial.map?.dispose();env.dispose();renderer.dispose();renderer.forceContextLoss();}
 };
}
