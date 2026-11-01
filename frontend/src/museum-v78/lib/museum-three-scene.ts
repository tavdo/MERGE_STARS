import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { museumArchitectureGeometry } from './museum-webgl.ts';
import { spatialExhibits, nodeById, cameraBasis, type SpatialCamera, type SpatialNodeId } from './museum-spatial.ts';
import { displayShape, displayYaw, triangulateOutline, pickMuseumExhibit, pickMuseumNode, navigationTarget } from './museum-display.ts';
import { interiorReference, frontFacades, interiorPanels, medallionCrop, centralMedallion, museumPresentationFov, museumLensShift, museumLensLift } from './museum-interior.ts';
import { museumPresentationAsset } from './museum-assets.ts';
import { coreVitrineSlots, type VitrineSlotId } from './museum-vitrine.ts';
import { inspectCoreGLB } from './core-gltf.ts';
import { disposeModelObjects } from './core-model-scene.ts';

export function applyMuseumCamera(camera: THREE.PerspectiveCamera, view: SpatialCamera, width: number, height: number) {
  const focus = view.focus ?? (view.framing === 'OBJECT');
  camera.aspect = width / Math.max(1, height); camera.fov = museumPresentationFov(view.fov, focus, width, height, view.displayBounds);
  camera.position.set(...view.position); const forward = cameraBasis(view).forward;
  camera.lookAt(view.position[0] + forward[0], view.position[1] + forward[1], view.position[2] + forward[2]);
  camera.updateProjectionMatrix();
  camera.projectionMatrix.elements[8] = -museumLensShift(focus, width);
  camera.projectionMatrix.elements[9] = -museumLensLift(focus, width);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert(); camera.updateMatrixWorld(true);
}

// Source geometry never changes: museum scale/rotation lives on a parent group.
export function fitModelForVitrine(source: THREE.Object3D) {
  source.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(source), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3()), longest = Math.max(size.x, size.y, size.z);
  if (![...size, ...center].every(Number.isFinite) || longest <= 0) throw Error('MODEL_GEOMETRY_INVALID');
  const group = new THREE.Group(), content = new THREE.Group(); content.add(source); content.position.sub(center); group.add(content); group.scale.setScalar(2.15 / longest); group.position.y = .53 + size.y * group.scale.y / 2;
  group.userData.displayScale = 'EXHIBITION_ONLY'; return group;
}

function photoGeometry(exhibit: typeof spatialExhibits[number]) {
  const shape = displayShape(exhibit), positions: number[] = [], uv: number[] = [], [l,t,r,b] = exhibit.crop ?? [0,0,1,1];
  for (const triangle of triangulateOutline(shape.outline)) for (const index of triangle) { const point = shape.outline[index]; positions.push((point[0]-.5)*shape.w,(.5-point[1])*shape.h,0); uv.push(l+(r-l)*point[0],1-(t+(b-t)*point[1])); }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3)); geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geometry.computeVertexNormals(); return geometry;
}
function cropPlane(width:number,height:number,crop:readonly[number,number,number,number]) {
  const geometry=new THREE.PlaneGeometry(width,height),uv=geometry.getAttribute('uv'),[l,t,r,b]=crop;
  for(let i=0;i<uv.count;i++)uv.setXY(i,l+(r-l)*uv.getX(i),1-(t+(b-t)*(1-uv.getY(i)))); return geometry;
}

export function buildMuseumArchitecture(){
  const room=new THREE.Group();room.name='MERGE Museum Room';room.userData.displayScale='EXHIBITION_ONLY';
  const geometry=new THREE.BufferGeometry(),interleaved=new THREE.InterleavedBuffer(museumArchitectureGeometry().vertices,12);
  geometry.setAttribute('position',new THREE.InterleavedBufferAttribute(interleaved,3,0));geometry.setAttribute('normal',new THREE.InterleavedBufferAttribute(interleaved,3,3));geometry.setAttribute('color',new THREE.InterleavedBufferAttribute(interleaved,3,6));
  const structure=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,metalness:.62,roughness:.32,side:THREE.DoubleSide}));structure.name='Preserved MERGE museum architecture';structure.receiveShadow=true;room.add(structure);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(30,96),new THREE.MeshPhysicalMaterial({color:0x080b12,metalness:.58,roughness:.2,clearcoat:1,clearcoatRoughness:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=.018;floor.receiveShadow=true;room.add(floor);
  const mosaicMaterial=new THREE.MeshStandardMaterial({color:0xc9af77,metalness:.9,roughness:.28}),mosaic=new THREE.InstancedMesh(new THREE.BoxGeometry(.11,.012,.11),mosaicMaterial,1100),matrix=new THREE.Matrix4();
  for(let i=0;i<1100;i++){const angle=i*2.399963,r=3.4+Math.sqrt(i/1100)*22;matrix.makeRotationY(angle);matrix.setPosition(Math.cos(angle)*r,.026,Math.sin(angle)*r);mosaic.setMatrixAt(i,matrix);mosaic.setColorAt(i,new THREE.Color(i%3?0xc9af77:0xcbd6e3));}mosaic.instanceMatrix.needsUpdate=true;mosaic.computeBoundingSphere();mosaic.name='MERGE gold and silver presentation mosaic';room.add(mosaic);
  return {room,mosaic};
}

export function createMuseumThreeRenderer(canvas:HTMLCanvasElement,onAssetError:(message:string)=>void,onInvalidate:()=>void=()=>{}) {
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  let initializingScene:THREE.Scene|null=null,initializingEnvironment:THREE.WebGLRenderTarget|null=null;
  try {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,canvas.clientWidth<900?1.5:2)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.debug.onShaderError=()=>{throw Error('MODEL_SHADER_UNAVAILABLE');};
  const scene=new THREE.Scene();initializingScene=scene;scene.background=new THREE.Color(0x080a10);scene.fog=new THREE.Fog(0x080a10,32,78);
  const camera=new THREE.PerspectiveCamera(65,1,.2,90);
  const {room,mosaic}=buildMuseumArchitecture();scene.add(room);
  scene.add(new THREE.HemisphereLight(0xdde6ff,0x2b2115,2));
  const key=new THREE.DirectionalLight(0xffe5bb,2.3);key.position.set(-9,14,10);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:.5,far:65});key.shadow.bias=-.0002;scene.add(key);
  const fill=new THREE.DirectionalLight(0xc3d8ff,1.8);fill.position.set(10,12,1);scene.add(fill);
  for(const [x,z] of [[-8,-7],[8,-7],[0,7]]){const light=new THREE.PointLight(x<0?0xffd89d:0xe3edff,110,27,2);light.position.set(x,10,z);scene.add(light);}
  const generator=new THREE.PMREMGenerator(renderer),environmentRoom=new RoomEnvironment(),environment=generator.fromScene(environmentRoom,.04);initializingEnvironment=environment;scene.environment=environment.texture;environmentRoom.dispose();generator.dispose();

  const textures=new Map<string,THREE.Texture>(),loaded=new Set<string>(),originals=new Set<string>(),images:HTMLImageElement[]=[],photoMaterials=new Map<string,THREE.MeshBasicMaterial[]>();let disposed=false;
  function register(mesh:THREE.Mesh<THREE.BufferGeometry,THREE.MeshBasicMaterial>,src:string){const list=photoMaterials.get(src)??[];list.push(mesh.material);photoMaterials.set(src,list);room.add(mesh);}
  function loadTexture(src:string,original=false){
    if(disposed||(textures.has(src)&&(!original||originals.has(src))))return;if(original)originals.add(src);
    const texture=textures.get(src)??new THREE.Texture();texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.set(src,texture);
    for(const material of photoMaterials.get(src)??[]){material.map=texture;material.needsUpdate=true;}
    const img=new Image();images.push(img);img.onload=()=>{if(disposed||(!original&&originals.has(src)))return;texture.image=img;texture.needsUpdate=true;loaded.add(src);onInvalidate();};img.onerror=()=>{if(disposed)return;if(img.src.endsWith('.webp')){img.src=src;return;}onAssetError('ორიგინალი ინტერიერი ან ექსპონატის ფოტო ვერ ჩაიტვირთა.');};img.src=original?src:museumPresentationAsset(src);
  }
  const photoMaterial=()=>new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,toneMapped:false});
  for(const panel of frontFacades){const mesh=new THREE.Mesh(cropPlane(panel.width,panel.height,panel.crop),photoMaterial());mesh.position.set(...panel.position);register(mesh,interiorReference);}
  for(const panel of interiorPanels.filter(value=>value.name.includes('colonnade')||value.name.includes('Rear'))){const p:number[]=[],uv:number[]=[],[l,t,r,b]=panel.crop;for(let i=0;i<24;i++){const a=(panel.start+(panel.end-panel.start)*i/24)*Math.PI/180,angle=(panel.start+(panel.end-panel.start)*(i+1)/24)*Math.PI/180,x=(angle:number)=>[Math.sin(angle)*29,-Math.cos(angle)*29],pa=x(a),pb=x(angle),left=l+(r-l)*i/24,right=l+(r-l)*(i+1)/24;for(const [pos,tex] of [[[pa[0],.15,pa[1]],[left,1-b]],[[pb[0],.15,pb[1]],[right,1-b]],[[pb[0],16.6,pb[1]],[right,1-t]],[[pa[0],.15,pa[1]],[left,1-b]],[[pb[0],16.6,pb[1]],[right,1-t]],[[pa[0],16.6,pa[1]],[left,1-t]]]){p.push(...pos);uv.push(...tex);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));register(new THREE.Mesh(geo,photoMaterial()),interiorReference);
  }
  const medallion=new THREE.CircleGeometry(centralMedallion.radius,96),medallionUV=medallion.getAttribute('uv');for(let i=0;i<medallionUV.count;i++)medallionUV.setXY(i,medallionCrop[0]+(medallionCrop[2]-medallionCrop[0])*medallionUV.getX(i),1-medallionCrop[3]+(medallionCrop[3]-medallionCrop[1])*medallionUV.getY(i));
  const emblem=new THREE.Mesh(medallion,photoMaterial());emblem.position.set(...centralMedallion.position);register(emblem,interiorReference);
  const photos=spatialExhibits.map(exhibit=>{const mesh=new THREE.Mesh(photoGeometry(exhibit),photoMaterial());mesh.position.set(...exhibit.position);mesh.rotation.y=displayYaw(exhibit);mesh.name=exhibit.title;mesh.userData={modelStatus:'VIEW_ONLY',displayScale:'EXHIBITION_ONLY'};register(mesh,exhibit.image);return {exhibit,mesh};});loadTexture(interiorReference);
  const vitrines=new Map<string,THREE.Group>(),resident=new Map<string,THREE.Group>();
  for(const slot of coreVitrineSlots){const group=new THREE.Group();group.position.set(slot.position[0],0,slot.position[2]);group.userData.slot=slot.id;vitrines.set(slot.id,group);room.add(group);
    const base=new THREE.Mesh(new THREE.CylinderGeometry(1.03,1.08,.46,48),new THREE.MeshStandardMaterial({color:0x10151b,metalness:.7,roughness:.24}));base.position.y=.23;group.add(base);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(1,.013,8,64),new THREE.MeshStandardMaterial({color:slot.position[0]<0?0xd6b87d:0xc9d5e6,metalness:.94,roughness:.2}));rim.rotation.x=Math.PI/2;rim.position.y=.47;group.add(rim);
    const glass=new THREE.Mesh(new THREE.CylinderGeometry(1.04,1.04,2.7,48,1,true),new THREE.MeshPhysicalMaterial({color:0xcbdcf5,transparent:true,opacity:.055,roughness:.06,metalness:.1,depthWrite:false,side:THREE.DoubleSide}));glass.position.y=1.85;glass.userData.slot=slot.id;group.add(glass);
    const glow=new THREE.Mesh(new THREE.RingGeometry(.92,1,48),new THREE.MeshBasicMaterial({color:0xd6c195,toneMapped:false,side:THREE.DoubleSide}));glow.rotation.x=-Math.PI/2;glow.position.y=.475;group.add(glow);
  }
  let arrows:THREE.Group|null=null,arrowNode='';
  function navigation(node:SpatialNodeId){if(arrowNode===node)return;if(arrows){room.remove(arrows);disposeModelObjects(arrows);}arrows=new THREE.Group();arrowNode=node;room.add(arrows);
    for(const target of nodeById(node).connected_nodes){const at=navigationTarget(node,target),shape=new THREE.Shape();shape.moveTo(-.22,-.16);shape.lineTo(.22,-.16);shape.lineTo(0,.46);shape.closePath();const arrow=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:0xe7d2a6,side:THREE.DoubleSide,toneMapped:false}));arrow.rotation.set(-Math.PI/2,0,0);const a=nodeById(node).scene_position,b=nodeById(target).scene_position;arrow.rotation.z=-Math.atan2(b[0]-a[0],-(b[2]-a[2]));arrow.position.set(at[0],.09,at[2]);arrows.add(arrow);}
  }
  const raycaster=new THREE.Raycaster();
  return {
    interiorReady:()=>!disposed&&loaded.has(interiorReference),
    render(view:SpatialCamera,node:string,selected?:typeof spatialExhibits[number]['id']){if(disposed||renderer.getContext().isContextLost())return;const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);renderer.setSize(width,height,false);applyMuseumCamera(camera,view,width,height);navigation(node as SpatialNodeId);for(const {exhibit,mesh} of photos){const nearby=Math.hypot(exhibit.position[0]-view.position[0],exhibit.position[2]-view.position[2])<27;if(nearby)loadTexture(exhibit.image,exhibit.id===selected);mesh.visible=nearby&&loaded.has(exhibit.image);}renderer.render(scene,camera);},
    pick(view:SpatialCamera,x:number,y:number){if(disposed)return null;const hit=pickMuseumExhibit(view,x,y,canvas.clientWidth,canvas.clientHeight);return hit&&loaded.has(hit.image)?hit:null;},
    pickNavigation(view:SpatialCamera,x:number,y:number,node:SpatialNodeId){return disposed||!loaded.has(interiorReference)?null:pickMuseumNode(view,x,y,canvas.clientWidth,canvas.clientHeight,node);},
    pickCore(view:SpatialCamera,x:number,y:number){applyMuseumCamera(camera,view,canvas.clientWidth,canvas.clientHeight);scene.updateMatrixWorld(true);raycaster.setFromCamera(new THREE.Vector2(x*2-1,1-y*2),camera);const hit=raycaster.intersectObjects([...vitrines.values()],true)[0];let object:THREE.Object3D|null=hit?.object??null;while(object){if(object.userData.slot)return object.userData.slot as VitrineSlotId;object=object.parent;}return null;},
    async placeModel(slot:VitrineSlotId,bytes:ArrayBuffer,signal:AbortSignal){
      inspectCoreGLB(bytes);const manager=new THREE.LoadingManager();manager.setURLModifier(url=>{if(!/^(blob:|data:image\/(png|jpeg|webp);base64,)/.test(url))throw Error('MODEL_EXTERNAL_RESOURCE_REJECTED');return url;});const asset=await new GLTFLoader(manager).parseAsync(bytes,'');
      if(disposed||signal.aborted||renderer.getContext().isContextLost()){disposeModelObjects(asset.scene);throw Error('MODEL_CANCELLED');}
      let display:THREE.Group;try{display=fitModelForVitrine(asset.scene);}catch(error){disposeModelObjects(asset.scene);throw error;}
      const parent=vitrines.get(slot);if(!parent){disposeModelObjects(display);throw Error('UNKNOWN_VITRINE');}
      const previous=resident.get(slot);if(previous){parent.remove(previous);disposeModelObjects(previous);resident.delete(slot);}
      // Two resident models maximum; explicit selection loads one at a time.
      const evicted:string[]=[];while(resident.size>=2){const first=resident.keys().next().value!;const old=resident.get(first)!;vitrines.get(first)?.remove(old);disposeModelObjects(old);resident.delete(first);evicted.push(first);}
      display.traverse(object=>{if((object as THREE.Mesh).isMesh){(object as THREE.Mesh).castShadow=true;(object as THREE.Mesh).receiveShadow=true;}});parent.add(display);resident.set(slot,display);try{renderer.render(scene,camera);}catch(error){parent.remove(display);resident.delete(slot);disposeModelObjects(display);throw error;}onInvalidate();return evicted;
    },
    rotateModel(slot:VitrineSlotId,angle:number){const model=resident.get(slot);if(model&&Number.isFinite(angle)){model.rotation.y=angle;onInvalidate();}},
    hasModel:(slot:VitrineSlotId)=>resident.has(slot),
    prepareModelSlot(slot:VitrineSlotId){const evicted:string[]=[],budget=canvas.clientWidth<900?1:2;while(resident.size>=budget&&!resident.has(slot)){const id=resident.keys().next().value!,model=resident.get(id)!;vitrines.get(id)?.remove(model);disposeModelObjects(model);resident.delete(id);evicted.push(id);}return evicted;},
    clearModel(slot:VitrineSlotId){const model=resident.get(slot);if(model){vitrines.get(slot)?.remove(model);disposeModelObjects(model);resident.delete(slot);onInvalidate();}},
    dispose(){if(disposed)return;disposed=true;for(const img of images){img.onload=null;img.onerror=null;}disposeModelObjects(scene);for(const texture of textures.values())texture.dispose();scene.traverse(object=>{const light=object as THREE.DirectionalLight;if(light.shadow)light.shadow.dispose();});mosaic.dispose();environment.dispose();resident.clear();vitrines.clear();scene.clear();renderer.dispose();renderer.forceContextLoss();},
  };
  }catch(error){if(initializingScene)disposeModelObjects(initializingScene);initializingEnvironment?.dispose();renderer.dispose();throw error;}
}
export type MuseumThreeRenderer=ReturnType<typeof createMuseumThreeRenderer>;
