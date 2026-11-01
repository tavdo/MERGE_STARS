import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {houseRoomSlots,houseRoomAccents,boundedRoomSnapshot,type HouseRoomSnapshot} from './house-room';
import type {CityHouseId} from './megapolis-domain';
import {disposeModelObjects} from './core-model-scene';
import {studiesFor,defaultVisualStudy} from './museum-studies';
import {buildStudyModel} from './museum-study-scene';

// Architectural showcase geometry only. These slots are never CORE products or Brand Lines.
export function buildHouseRoom(houseId:CityHouseId){
 const root=new THREE.Group();root.name=houseId+' House architecture';
 const gold=new THREE.MeshStandardMaterial({color:'#d7b678',metalness:.88,roughness:.2}),silver=new THREE.MeshStandardMaterial({color:'#c3d1d8',metalness:.86,roughness:.24}),stone=new THREE.MeshStandardMaterial({color:'#14191e',metalness:.32,roughness:.25}),velvet=new THREE.MeshStandardMaterial({color:houseRoomAccents[houseId],roughness:.92}),glass=new THREE.MeshPhysicalMaterial({color:'#c8dfdf',metalness:.05,roughness:.1,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide}),glow=new THREE.MeshBasicMaterial({color:'#f5d6a3'});
 const cylinder=(parent:THREE.Group,r:number,h:number,x:number,y:number,z:number,mat:THREE.Material)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,40),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const ring=(parent:THREE.Group,r:number,x:number,y:number,z:number,mat:THREE.Material,tube=.04)=>{const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,tube,8,72),mat);mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 cylinder(root,14,.3,0,-.2,0,stone);ring(root,13.7,0,.01,0,gold,.09);ring(root,6.1,0,.01,0,silver);cylinder(root,4.2,.02,0,.02,0,velvet);ring(root,4.15,0,.04,0,gold,.05);
 const wall=new THREE.Mesh(new THREE.CylinderGeometry(14,14,10,72,1,true),new THREE.MeshStandardMaterial({color:houseRoomAccents[houseId],roughness:.75,side:THREE.DoubleSide}));wall.position.y=5;root.add(wall);
 for(let i=0;i<20;i++){const a=i*Math.PI/10,x=Math.sin(a)*13.65,z=Math.cos(a)*13.65;cylinder(root,.18,9.5,x,4.7,z,i%2?gold:silver);cylinder(root,.35,.15,x,.1,z,gold);cylinder(root,.34,.15,x,9.4,z,gold);}
 ring(root,13.6,0,8.5,0,gold,.12);ring(root,13.6,0,8.25,0,glow,.035);
 const dome=new THREE.Mesh(new THREE.SphereGeometry(14,48,20,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:'#20262b',metalness:.3,roughness:.4,side:THREE.DoubleSide}));dome.position.y=9.5;dome.scale.y=.4;root.add(dome);
 for(let i=0;i<6;i++){const rib=new THREE.Mesh(new THREE.TorusGeometry(14,.045,8,64,Math.PI),gold);rib.scale.y=.4;rib.rotation.y=i*Math.PI/6;rib.position.y=9.5;root.add(rib);}
 // A restrained central light installation, not a replacement company logo.
 for(const [r,y] of [[1.9,7.3],[1.3,6.8],[.7,6.35]]){ring(root,r,0,y,0,gold,.07);ring(root,r,0,y-.06,0,glow,.025);}
 const specifications=houseRoomSlots(houseId),showcases:THREE.Group[]=[],pickables:THREE.Object3D[]=[];
 for(const slot of specifications){
  const group=new THREE.Group();group.name=slot.label;group.position.set(slot.x,0,slot.z);group.userData={category:slot.category,houseId,index:slot.index,kind:'CATEGORY_SHOWCASE',core_product_id:null};
  cylinder(group,1.12,.25,0,.14,0,stone);ring(group,1.11,0,.29,0,gold,.045);cylinder(group,.76,.6,0,.6,0,velvet);ring(group,.78,0,.92,0,silver,.03);
  const shell=cylinder(group,1.08,3.2,0,1.95,0,glass);shell.userData.slot=slot.index;pickables.push(shell);
  ring(group,1.1,0,3.58,0,gold,.065);ring(group,1.08,0,3.49,0,glow,.025);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;cylinder(group,.022,3.3,Math.sin(a)*1.08,1.95,Math.cos(a)*1.08,gold);}
  const study=studiesFor(houseId,slot.category)[0];
  if(study){const model=buildStudyModel({...defaultVisualStudy(study.id),mosaic:'medium'}),bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),scale=1.4/Math.max(size.x,size.y,size.z);model.position.sub(center);model.position.y+=size.y/2;const placement=new THREE.Group();placement.name=study.title+' · concept study';placement.userData={kind:'DESIGN_STUDY_PREVIEW',reference_id:study.id,core_product_id:null};placement.add(model);placement.scale.setScalar(scale);placement.position.y=.94;group.add(placement);}
  root.add(group);showcases.push(group);
 }
 return {root,showcases,pickables,specifications};
}

export function createHouseRoomRenderer(canvas:HTMLCanvasElement,houseId:CityHouseId,snapshot?:HouseRoomSnapshot|null){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#0c1118');const room=buildHouseRoom(houseId);scene.add(room.root);
 scene.add(new THREE.HemisphereLight('#e4edff','#342513',2.4));const key=new THREE.DirectionalLight('#ffe5b5',4);key.position.set(-3,12,9);scene.add(key);const fill=new THREE.DirectionalLight('#cce3f5',2.5);fill.position.set(9,7,-4);scene.add(fill);
 let environment:THREE.WebGLRenderTarget|null=null;try{const pmrem=new THREE.PMREMGenerator(renderer),studio=new RoomEnvironment();environment=pmrem.fromScene(studio,.04);scene.environment=environment.texture;studio.dispose();pmrem.dispose();}catch{/* Lighting still provides the same actual geometry. */}
 const camera=new THREE.PerspectiveCamera(58,1,.1,100),raycaster=new THREE.Raycaster(),state=boundedRoomSnapshot(houseId,snapshot);let disposed=false,first=true,lastWidth=0,lastHeight=0;
 const targetPosition=new THREE.Vector3(),targetLook=new THREE.Vector3(),look=new THREE.Vector3(0,2.5,0);
 function pose(){const selected=state.selected===null?null:room.specifications[state.selected];if(selected){targetPosition.set(selected.x*.57,3.1,selected.z*.57);targetLook.set(selected.x,1.9,selected.z);}else{targetPosition.set(Math.sin(state.yaw)*11.6,4.1,Math.cos(state.yaw)*11.6);targetLook.set(0,2.5,0);}}
 pose();camera.position.copy(targetPosition);look.copy(targetLook);
 return {
  render(seconds:number,reduced:boolean){if(disposed||renderer.getContext().isContextLost())return false;const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);if(w!==lastWidth||h!==lastHeight){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();lastWidth=w;lastHeight=h;}pose();const k=reduced||first?1:1-Math.exp(-Math.min(.05,seconds)*5);camera.position.lerp(targetPosition,k);look.lerp(targetLook,k);camera.lookAt(look);camera.updateMatrixWorld();renderer.render(scene,camera);first=false;return camera.position.distanceTo(targetPosition)>.003||look.distanceTo(targetLook)>.003;},
  focus(index:number|null){if(index!==null&&(!Number.isInteger(index)||index<0||index>=room.specifications.length))throw Error('INVALID_SHOWCASE');state.selected=index;},
  orbit(delta:number){if(!Number.isFinite(delta))return;state.selected=null;state.yaw=Math.max(-Math.PI*20,Math.min(Math.PI*20,state.yaw+delta));},
  snapshot(){return {...state};},
  markers(){if(disposed)return [];return room.specifications.map(slot=>{const p=new THREE.Vector3(slot.x,3.8,slot.z).project(camera);return {index:slot.index,x:(p.x+1)*50,y:(1-p.y)*50,visible:p.z>-1&&p.z<1&&Math.abs(p.x)<.95&&Math.abs(p.y)<.9};});},
  pick(x:number,y:number){if(disposed||!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1||y<0||y>1)return null;raycaster.setFromCamera(new THREE.Vector2(x*2-1,1-y*2),camera);const hit=raycaster.intersectObjects(room.pickables,false)[0];return Number.isInteger(hit?.object.userData.slot)?hit.object.userData.slot as number:null;},
  dispose(){if(disposed)return;disposed=true;disposeModelObjects(scene);environment?.dispose();renderer.dispose();renderer.forceContextLoss();},
 };
}
