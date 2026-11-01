import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildingPosition, cityChurch, cityGrandMuseum, type CityBuilding, type CityPosition } from './megapolis-domain.ts';
import { companyIdentity } from './company-identity.ts';
import { buildPresentationAvatar, type AvatarPresentation } from './presentation-avatar.ts';
import { advanceAvatar, idleAvatar, safeCityCamera, defaultCityCamera, type AvatarState, type CameraPreference } from './megapolis-motion.ts';
import { buildMegapolisEntrance, entranceFrame, entranceReferences, type EntranceState } from './megapolis-entrance.ts';
import { neutralBodyShape, type DisplayBodyShape } from './fit-measurements.ts';
import { createFrameMonitor, safeGraphics, graphicsProfiles, type GraphicsChoice, type GraphicsProfile } from './megapolis-quality.ts';
export type { AvatarPresentation } from './presentation-avatar.ts';

type MarkerTarget = { key: string; point: THREE.Vector3 };
export type CityMarker = { key: string; x: number; y: number; visible: boolean };

// Screen positions only: scene coordinates must never become physical product dimensions.
export function projectCityMarkers(camera: THREE.PerspectiveCamera, targets: readonly MarkerTarget[]): CityMarker[] {
  camera.updateMatrixWorld();
  return targets.map(target => {
    const local = target.point.clone().applyMatrix4(camera.matrixWorldInverse);
    const screen = target.point.clone().project(camera);
    return { key: target.key, x: (screen.x + 1) * 50, y: (1 - screen.y) * 50,
      visible: local.z < -.2 && screen.z >= -1 && screen.z <= 1 && Math.abs(screen.x) < .86 && screen.y > -.6 && screen.y < .65 };
  });
}

export function buildMegapolisGeometry(buildings: readonly CityBuilding[], avatarPresentation: AvatarPresentation = 'woman', quality:GraphicsProfile='HIGH') {
  const root = new THREE.Group(); root.name = 'MERGE Megapolis presentation'; root.userData.displayScale = 'EXHIBITION_ONLY';
  const material = (color: THREE.ColorRepresentation, metalness = .5, roughness = .3) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const stone = material('#141619', .38, .24), ivory = material('#51565d', .48, .28), gold = material('#dfb876', .92, .22), silver = material('#d5dbe3', .92, .2);
  const glass = new THREE.MeshPhysicalMaterial({ color: '#7bafb5', transparent: true, opacity: .24, roughness: .12, metalness: .4, depthWrite: false });
  const boxes = new THREE.BoxGeometry(1, 1, 1), cylinders = new THREE.CylinderGeometry(1, 1, 1, 12), spheres = new THREE.SphereGeometry(1, 14, 10);
  const archGeometry = new THREE.TorusGeometry(1, .075, 6, 24, Math.PI);
  function box(parent: THREE.Group, x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) {
    const mesh = new THREE.Mesh(boxes, mat); mesh.position.set(x,y,z); mesh.scale.set(w,h,d); mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function column(parent: THREE.Group, x: number, y: number, z: number, radius: number, height: number, mat: THREE.Material) {
    const mesh = new THREE.Mesh(cylinders, mat); mesh.position.set(x,y,z); mesh.scale.set(radius,height,radius); mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  box(root, 0,-.3,-12,86,.6,148,ivory);
  const entryGate=buildMegapolisEntrance(gold,stone);root.add(entryGate.root);
  const marble=new THREE.MeshPhysicalMaterial({color:'#121418',metalness:.38,roughness:.19,clearcoat:1,clearcoatRoughness:.12});
  const boulevard=box(root,0,.01,0,18,.03,100,marble);boulevard.name='Gold and silver mosaic boulevard';
  for (const x of [-9.2,9.2]) box(root,x,.06,0,.16,.12,98,gold);
  const mosaic = new THREE.InstancedMesh(boxes, gold, 1100), matrix = new THREE.Matrix4();
  const palette = ['#d6b67b','#c7d5e2','#8b744c','#6b737c','#25282d'];
  for (let i=0;i<1100;i++) {
    const row=Math.floor(i/22), col=i%22, scale=.22+(i%3)*.07;
    matrix.makeScale(scale,.018,scale); matrix.setPosition(-7.7+col*.72,.048,38-row*1.52); mosaic.setMatrixAt(i,matrix);
    mosaic.setColorAt(i,new THREE.Color(palette[(row+col)%palette.length]));
  }
  mosaic.instanceMatrix.needsUpdate=true; mosaic.computeBoundingSphere(); root.add(mosaic);
  const entrances: THREE.Object3D[] = [], markers: MarkerTarget[] = [];
  const signTargets: { building: CityBuilding; parent: THREE.Group; x: number; yaw: number }[] = [];
  const curtains: THREE.Mesh[] = [];
  const doors=new Map<string,{left:THREE.Group;right:THREE.Group;progress:number;target:number}>();
  const corniceGeometry=new THREE.CylinderGeometry(5.95,5.95,.15,32);
  const goldCornices=new THREE.InstancedMesh(corniceGeometry,gold,Math.min(12,buildings.length)*3),silverCornices=new THREE.InstancedMesh(corniceGeometry,silver,Math.min(12,buildings.length));
  buildings.slice(0,12).forEach((building,index)=>{
    const [x,z]=buildingPosition(index), house=new THREE.Group(); house.position.set(x,0,z); house.name=building.title;
    house.userData.buildingKey=building.key; root.add(house); entrances.push(house);
    const body=new THREE.Mesh(new THREE.CylinderGeometry(5.6,5.8,9.7,32),ivory);body.position.y=4.85;body.castShadow=true;house.add(body);
    for(const [level,height] of [.22,7.6,9.8].entries()){matrix.makeTranslation(x,height,z);goldCornices.setMatrixAt(index*3+level,matrix);}matrix.makeTranslation(x,3.8,z);silverCornices.setMatrixAt(index,matrix);
    const accent=material(building.color,.55), face=x<0?6.03:-6.03, yaw=x<0?Math.PI/2:-Math.PI/2;
    for (const level of [1.1,4.5,8]) {
      box(house,face,level+.85,0,.07,2.7,7,glass);
      box(house,0,level+2.3,0,12.35,.18,9.35,level===4.5?silver:gold);
    }
    // Reusable carved arches and illuminated windows, not product geometry.
    for(const level of [4.5,8]) {
      const upperArch=new THREE.Mesh(archGeometry,level===4.5?silver:gold);upperArch.rotation.y=yaw;upperArch.position.set(face+Math.sign(-x)*.12,level+1.15,0);upperArch.scale.set(3.15,1.05,1);house.add(upperArch);
    }
    const roofDome=new THREE.Mesh(new THREE.SphereGeometry(2.25,24,12,0,Math.PI*2,0,Math.PI/2),index%2?silver:gold);roofDome.position.set(0,10.8,0);roofDome.scale.set(1.3,.75,1);house.add(roofDome);
    for (const edge of [-3.6,3.6]) {
      column(house,face,5,edge,.19,10,ivory);
      box(house,face-.12*Math.sign(x),5,edge,.22,9.8,.12,gold);
    }
    box(house,face,2,0,.09,3.7,2.8,accent);
    const portal=new THREE.Group();portal.name='Accessible House door';portal.position.set(face+Math.sign(-x)*.16,0,0);portal.rotation.y=yaw;house.add(portal);
    const hinges=[-1,1].map((side)=>{const hinge=new THREE.Group();hinge.position.set(side*1.4,0,0);portal.add(hinge);const leaf=new THREE.Mesh(new THREE.BoxGeometry(1.4,3.6,.075),side<0?gold:silver);leaf.position.set(-side*.7,1.83,0);leaf.castShadow=true;hinge.add(leaf);return hinge;});
    doors.set(building.key,{left:hinges[0],right:hinges[1],progress:0,target:0});
    const arch=new THREE.Mesh(archGeometry,gold); arch.rotation.y=yaw; arch.position.set(face+Math.sign(-x)*.06,3.5,0); arch.scale.set(1.4,1.5,1); house.add(arch);
    for (const zCurtain of [-2.5,2.5]) {
      const curtain=box(house,face+.08*Math.sign(-x),2.35,zCurtain,.07,2.8,.65,accent); curtains.push(curtain);
    }
    box(house,0,10.6,0,12.6,.32,9.6,ivory);
    signTargets.push({building,parent:house,x:face+Math.sign(-x)*.14,yaw});
    markers.push({key:building.key,point:new THREE.Vector3(face+x-Math.sign(x)*.7,4.2,z)});
  });

  for(const cornices of [goldCornices,silverCornices]){cornices.instanceMatrix.needsUpdate=true;cornices.computeBoundingSphere();root.add(cornices);}
  const palace=new THREE.Group(); palace.position.set(0,0,-49); palace.name='Grand Living Museum'; root.add(palace);
  palace.userData.buildingKey=cityGrandMuseum.key;entrances.push(palace);markers.push({key:cityGrandMuseum.key,point:new THREE.Vector3(0,13,-41)});
  const centralWall=new THREE.Mesh(new THREE.CylinderGeometry(7.8,8,22,48,1,true,.45,Math.PI*2-.9),ivory);centralWall.position.y=11;centralWall.castShadow=true;palace.add(centralWall);
  for(const side of [-1,1]){const wing=box(palace,side*13,7,0,10,14,12,ivory);wing.castShadow=true;box(palace,side*7.5,11,6.2,2.6,22,2.2,ivory);}
  for(const x of [-17,-11,-6,6,11,17])column(palace,x,x===-6||x===6?11:7,6.4,.25,x===-6||x===6?22:14,gold);
  for(const y of [3.4,7.3,11.2,14])box(palace,0,y,0,36,.16,13,y===7.3?silver:gold);
  const portalArch=new THREE.Mesh(new THREE.TorusGeometry(1,.045,8,48,Math.PI),gold);portalArch.position.set(0,11,7.1);portalArch.scale.set(5.6,7.2,1);palace.add(portalArch);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(9,32,16,0,Math.PI*2,0,Math.PI/2),glass);dome.position.y=22;dome.scale.z=.65;palace.add(dome);
  const domeRibs=new THREE.InstancedMesh(new THREE.TorusGeometry(9,.055,6,48,Math.PI),gold,8);
  for(let i=0;i<8;i++){matrix.makeRotationY(i*Math.PI/8);matrix.scale(new THREE.Vector3(1,1,.65));matrix.setPosition(0,22,0);domeRibs.setMatrixAt(i,matrix);}domeRibs.instanceMatrix.needsUpdate=true;domeRibs.computeBoundingSphere();palace.add(domeRibs);
  const steps=new THREE.InstancedMesh(boxes,ivory,6);
  for(let i=0;i<6;i++){matrix.makeScale(17-i*.55,.17,2.8-i*.34);matrix.setPosition(0,.085+i*.17,7.5);steps.setMatrixAt(i,matrix);}steps.instanceMatrix.needsUpdate=true;steps.computeBoundingSphere();palace.add(steps);
  column(root,28,.09,-48,3.7,.18,silver);
  const waterMaterial=new THREE.MeshStandardMaterial({color:'#468b9b',metalness:.72,roughness:.12,transparent:true,opacity:.82});
  const water=column(root,28,.2,-48,3.35,.04,waterMaterial); water.userData.displayScale='EXHIBITION_ONLY';
  const fountainRings:THREE.Mesh[]=[];
  for(let i=0;i<3;i++) {
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.022,5,40),silver); ring.rotation.x=-Math.PI/2; ring.position.set(28,.25,-48); root.add(ring); fountainRings.push(ring);
  }

  // Georgian cross-dome architectural concept. No real institution or endorsement is claimed.
  const church=new THREE.Group(); church.name='Georgian Church · virtual architecture';
  church.position.set(cityChurch.x,0,cityChurch.z); church.userData.buildingKey=cityChurch.key; root.add(church); entrances.push(church);
  const churchStone=material('#cfc5ac',.15,.6), roofMaterial=material('#758191',.7,.32);
  const churchBody=box(church,0,3.4,0,10.5,6.8,16,churchStone); churchBody.castShadow=true;
  box(church,0,3.4,0,16,6.8,7,churchStone);
  for(const [x,z,w,d] of [[0,0,11.3,17],[-5.4,0,5.5,8],[5.4,0,5.5,8]] as const) {
    const roof=new THREE.Mesh(new THREE.ConeGeometry(1,1,4),roofMaterial); roof.rotation.y=Math.PI/4; roof.position.set(x,7.2,z); roof.scale.set(w*.71,3,d*.71); roof.castShadow=true; church.add(roof);
  }
  const drum=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.5,4.4,12),churchStone); drum.position.y=10; drum.castShadow=true; church.add(drum);
  const churchDome=new THREE.Mesh(new THREE.ConeGeometry(2.7,4.6,12),gold); churchDome.position.y=14; churchDome.castShadow=true; church.add(churchDome);
  box(church,0,17.2,0,.14,2.5,.14,gold); box(church,0,17.6,0,1.2,.14,.14,gold);
  const doorMaterial=material('#55432f',.5), candleMaterial=new THREE.MeshStandardMaterial({color:'#fff1c6',emissive:'#efab43',emissiveIntensity:.7,roughness:.6});
  box(church,0,2,8.05,2.3,4,.15,doorMaterial);
  const doorArch=new THREE.Mesh(archGeometry,gold); doorArch.position.set(0,3.6,8.15); doorArch.scale.set(1.3,1.8,1); church.add(doorArch);
  for(const x of [-3.7,3.7]) {
    box(church,x,3.7,8.06,.65,2.4,.1,candleMaterial);
    column(church,x,3.7,8.25,.1,6.6,silver);
  }
  for(const z of [-5,0,5]) for(const side of [-1,1]) box(church,side*5.3,3.7,z,.12,2.5,.7,candleMaterial);
  box(church,0,.2,9.7,7,.4,3,churchStone); box(church,0,.1,11.3,9,.2,1,ivory);
  markers.push({key:cityChurch.key,point:new THREE.Vector3(cityChurch.x,7,cityChurch.z+8)});

  const plants=new THREE.Group(); plants.name='Sculptural nature · display only'; plants.userData.displayScale='EXHIBITION_ONLY'; root.add(plants);
  const leaves=material('#3e7955',.22,.6), petals=material('#bd647b',.2), trunks=material('#b9cad1',.85), stemGold=material('#d1af73',.85);
  const plantSurfaces:THREE.Mesh[]=[], trees:THREE.Group[]=[];
  const flowerPetals=new THREE.InstancedMesh(spheres,petals,240); let petalIndex=0;
  for(let i=0;i<16;i++) {
    const x=i%2?10.1:-10.1,z=34-Math.floor(i/2)*10.5,tree=new THREE.Group(); tree.position.set(x,0,z); plants.add(tree); trees.push(tree);
    const trunk=column(tree,0,1.1,0,.16,2.2,trunks); plantSurfaces.push(trunk);
    for(const [dx,dy,dz,s] of [[0,3,0,1.2],[-.5,2.5,0,.8],[.5,2.6,.1,.8]]) {
      const leaf=new THREE.Mesh(spheres,leaves); leaf.position.set(dx,dy,dz); leaf.scale.set(s,s*1.3,s); leaf.castShadow=true; tree.add(leaf);
    }
    for(let flower=0;flower<3;flower++) {
      const fx=x+(x>0?1:-1)*(.35+flower*.4),fz=z+1.6;
      const stem=column(plants,fx,.35,fz,.025,.7,stemGold); plantSurfaces.push(stem);
      for(let p=0;p<5;p++) {
        matrix.makeScale(.14,.045,.18); matrix.setPosition(fx+Math.cos(p*Math.PI*2/5)*.13,.75,fz+Math.sin(p*Math.PI*2/5)*.13);
        flowerPetals.setMatrixAt(petalIndex++,matrix);
      }
    }
  }
  flowerPetals.instanceMatrix.needsUpdate=true; flowerPetals.computeBoundingSphere(); plants.add(flowerPetals);
  const lamps=new THREE.InstancedMesh(cylinders,gold,16);
  for(let i=0;i<16;i++) {matrix.makeScale(.06,3.2,.06); matrix.setPosition(i%2?8.8:-8.8,1.6,34-Math.floor(i/2)*10.5);lamps.setMatrixAt(i,matrix);}
  lamps.instanceMatrix.needsUpdate=true;lamps.computeBoundingSphere();root.add(lamps);
  const lanternMaterial=new THREE.MeshStandardMaterial({color:'#fff0c9',emissive:'#e0a04e',emissiveIntensity:1.4,metalness:.15,roughness:.35});
  const lanterns=new THREE.InstancedMesh(spheres,lanternMaterial,16);
  for(let i=0;i<16;i++){matrix.makeScale(.21,.3,.21);matrix.setPosition(i%2?8.8:-8.8,3.3,34-Math.floor(i/2)*10.5);lanterns.setMatrixAt(i,matrix);}
  lanterns.instanceMatrix.needsUpdate=true;lanterns.computeBoundingSphere();root.add(lanterns);
  const mountains=new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,5),material('#c7ced4',.08,.85),18);
  for(let i=0;i<18;i++){const side=i%2?-1:1;matrix.makeRotationY(i*.71);matrix.scale(new THREE.Vector3(12+i%4*3,20+i%5*7,13+i%3*4));matrix.setPosition(side*(58+i%3*10),8+i%5*2,-75-Math.floor(i/2)*10);mountains.setMatrixAt(i,matrix);}mountains.instanceMatrix.needsUpdate=true;mountains.computeBoundingSphere();root.add(mountains);
  const terraceMaterial=material('#d9d9d0',.24,.4);
  for(const side of [-1,1]){box(root,side*30,1,-16,6,2,80,terraceMaterial);const channel=box(root,side*28,.08,-8,3,.07,94,waterMaterial);channel.name='Reflective garden water';}
  const balusters=new THREE.InstancedMesh(cylinders,gold,100);
  for(let i=0;i<100;i++){matrix.makeScale(.055,1,.055);matrix.setPosition(i%2?-9.65:9.65,.55,39-Math.floor(i/2)*1.58);balusters.setMatrixAt(i,matrix);}balusters.instanceMatrix.needsUpdate=true;balusters.computeBoundingSphere();root.add(balusters);
  for(const x of [-9.65,9.65])box(root,x,1.08,0,.09,.08,80,gold);
  const waterfallMaterial=new THREE.MeshPhysicalMaterial({color:'#c5e7e8',roughness:.12,metalness:.35,transparent:true,opacity:.65,clearcoat:1});
  const falls=new THREE.InstancedMesh(boxes,waterfallMaterial,8);
  for(let i=0;i<8;i++){matrix.makeScale(5,4.7,.05);matrix.setPosition(i%2?-30:30,4,-3-Math.floor(i/2)*17);falls.setMatrixAt(i,matrix);}falls.instanceMatrix.needsUpdate=true;falls.computeBoundingSphere();root.add(falls);
  const gem=new THREE.Mesh(new THREE.OctahedronGeometry(2.1),new THREE.MeshPhysicalMaterial({color:'#c3e2ec',metalness:.3,roughness:.08,transparent:true,opacity:.8,clearcoat:1}));gem.position.set(0,7,-39);gem.name='Central presentation crystal';root.add(gem);
  const avatarRig=buildPresentationAvatar(avatarPresentation,quality),avatar=avatarRig.root,legs=avatarRig.legs,arms=avatarRig.arms;root.add(avatar);
  return {root,entryGate,avatar,legs,arms,palace,church,entrances,signTargets,markers,plantSurfaces,gold,silver,trees,curtains,fountainRings,candleMaterial,avatarRig,doors};
}

function disposeScene(scene:THREE.Scene) {
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
  scene.traverse(object=>{const mesh=object as THREE.Mesh;if(mesh.geometry)geometries.add(mesh.geometry);if(mesh.material)for(const mat of Array.isArray(mesh.material)?mesh.material:[mesh.material])materials.add(mat);});
  for(const geometry of geometries)geometry.dispose(); for(const material of materials)material.dispose(); scene.clear();
}

export function createMegapolisRenderer(canvas:HTMLCanvasElement,buildings:readonly CityBuilding[],onInvalidate:()=>void,avatarPresentation:AvatarPresentation='woman',options:{quality?:GraphicsChoice;onStats?:(stats:{fps:number;profile:GraphicsProfile})=>void}={}) {
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  const mobile=canvas.clientWidth<700;
  const capabilities={maxTexture:renderer.getContext().getParameter(renderer.getContext().MAX_TEXTURE_SIZE) as number,cores:navigator.hardwareConcurrency||4,memory:(navigator as Navigator&{deviceMemory?:number}).deviceMemory??0,mobile};
  let profile=safeGraphics(options.quality??'AUTO',capabilities);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,graphicsProfiles[profile].pixelRatio));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const scene=new THREE.Scene(),textures:THREE.Texture[]=[]; let environment:THREE.WebGLRenderTarget|undefined;
  try {
    scene.background=new THREE.Color('#8093aa');scene.fog=new THREE.Fog('#a7b0b8',80,210);
    const camera=new THREE.PerspectiveCamera(57,1,.2,260),world=buildMegapolisGeometry(buildings,avatarPresentation,profile);scene.add(world.root);
    scene.add(new THREE.HemisphereLight('#dfe6ee','#332819',1.7));
    const sunlight=new THREE.DirectionalLight('#ffe2ae',3);sunlight.position.set(-24,45,12);sunlight.castShadow=true;
    sunlight.shadow.mapSize.set(graphicsProfiles[profile].shadowSize,graphicsProfiles[profile].shadowSize);
    Object.assign(sunlight.shadow.camera,{left:-47,right:47,top:85,bottom:-55,near:1,far:180});sunlight.shadow.bias=-.0002;scene.add(sunlight);
    const fill=new THREE.DirectionalLight('#c6d2dc',1.15);fill.position.set(25,20,-20);scene.add(fill);
    const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
    try {environment=generator.fromScene(room,.06);scene.environment=environment.texture;}finally{room.dispose();generator.dispose();}
    let disposed=false,view:'city'|'church'='city',churchAngle=-.3,churchDistance=28,lastTime=0,viewportWidth=0,viewportHeight=0,lastShadowTime=0;
    const cameraTarget=new THREE.Vector3(),desired=new THREE.Vector3(),frameMonitor=createFrameMonitor();
    let entranceState:EntranceState='INSIDE',entranceStarted=0,approached:string|null=null;
    let avatarMotion=idleAvatar(),context:AvatarState='IDLE',previousPosition:CityPosition|null=null,cameraPreference:CameraPreference={...defaultCityCamera},restoreOnce=false;
    function label(text:string,width:number,height:number) {
      const element=document.createElement('canvas');element.width=1024;element.height=192;const context=element.getContext('2d');if(!context)return null;
      context.fillStyle='#0b1119';context.fillRect(0,0,1024,192);context.fillStyle='#edddba';context.font='bold 48px Georgia';context.textAlign='center';context.textBaseline='middle';context.fillText(text,512,96,960);
      const texture=new THREE.CanvasTexture(element);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
      return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,toneMapped:false,side:THREE.DoubleSide}));
    }
    const loader=new THREE.TextureLoader();let portalStatus:'loading'|'ready'|'unavailable'='loading';
    const portalArt=loader.load(entranceReferences.closed,()=>{if(disposed)portalArt.dispose();else{portalStatus='ready';onInvalidate();}},undefined,()=>{portalStatus='unavailable';onInvalidate();});portalArt.colorSpace=THREE.SRGBColorSpace;textures.push(portalArt);for(const face of world.entryGate.faces){face.map=portalArt;face.needsUpdate=true;}
    const logo=loader.load(companyIdentity.mark,()=>{if(disposed)logo.dispose();else onInvalidate();});logo.colorSpace=THREE.SRGBColorSpace;textures.push(logo);
    (world.avatarRig.badge.material as THREE.MeshBasicMaterial).map=logo;(world.avatarRig.badge.material as THREE.MeshBasicMaterial).needsUpdate=true;world.avatarRig.badge.rotation.y=Math.PI;
    for(const sign of world.signTargets) {
      const text=label(sign.building.title,7.5,1.2);if(text){text.rotation.y=sign.yaw;text.position.set(sign.x,6,0);sign.parent.add(text);}
      const badge=new THREE.Mesh(new THREE.PlaneGeometry(1.25,1.45),new THREE.MeshBasicMaterial({map:logo,toneMapped:false,side:THREE.DoubleSide}));badge.rotation.y=sign.yaw;badge.position.set(sign.x,8,0);sign.parent.add(badge);
    }
    const mainMark=new THREE.Mesh(new THREE.PlaneGeometry(2.5,2.5),new THREE.MeshBasicMaterial({map:logo,toneMapped:false}));mainMark.position.set(0,23,6.3);world.palace.add(mainMark);
    const mainSign=label('MERGE STARS',10,1.9);if(mainSign){mainSign.position.set(0,20,7.4);world.palace.add(mainSign);}
    const museumSign=label('GRAND LIVING MUSEUM',10,1.15);if(museumSign){museumSign.position.set(0,17.9,7.4);world.palace.add(museumSign);}
    const raycaster=new THREE.Raycaster();
    return {
      render(position:CityPosition,time:number,walking:boolean,motion=true) {
        if(disposed||renderer.getContext().isContextLost())return;
        const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight),dt=lastTime?Math.min(.05,(time-lastTime)/1000):0;
        if(width!==viewportWidth||height!==viewportHeight){renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();viewportWidth=width;viewportHeight=height;}
        if(!lastTime||walking||motion&&time-lastShadowTime>250){renderer.shadowMap.needsUpdate=true;lastShadowTime=time;}
        // Reveal real architecture behind the opening leaves, never a city photo plane.
        for(const object of world.root.children)object.visible=entranceState!=='CLOSED'||object===world.entryGate.root;
        world.avatar.visible=view==='city'&&entranceState==='INSIDE';world.avatar.position.set(position.x,0,position.z);world.avatar.rotation.y=position.yaw;
        const travelled=previousPosition?Math.hypot(position.x-previousPosition.x,position.z-previousPosition.z):0;
        const turn=previousPosition?Math.atan2(Math.sin(previousPosition.yaw-position.yaw),Math.cos(previousPosition.yaw-position.yaw)):0;
        avatarMotion=advanceAvatar(avatarMotion,{distance:travelled,turn,seconds:dt,context});world.avatarRig.pose(avatarMotion,dt,motion);previousPosition={...position};
        for(const door of world.doors.values()){door.progress+=(door.target-door.progress)*(1-Math.exp(-dt*5.5));door.left.rotation.y=-door.progress*Math.PI*.53;door.right.rotation.y=door.progress*Math.PI*.53;}
        const t=motion?time*.001:0;
        world.trees.forEach((tree,i)=>tree.rotation.z=motion?Math.sin(t*.7+i)*.012:0);
        world.curtains.forEach((curtain,i)=>curtain.rotation.x=motion?Math.sin(t*.9+i)*.025:0);
        world.fountainRings.forEach((ring,i)=>{const phase=(t*.35+i/3)%1;ring.scale.setScalar(.6+phase*2.5);ring.position.y=.25+Math.sin(t+i)*.012;});
        world.candleMaterial.emissiveIntensity=motion?.7+Math.sin(t*2.3)*.08:.7;
        if(view==='church') {desired.set(cityChurch.x+Math.sin(churchAngle)*churchDistance,10,cityChurch.z+Math.cos(churchAngle)*churchDistance);cameraTarget.set(cityChurch.x,7,cityChurch.z);}
        else {const index=buildings.findIndex(b=>b.key===approached);if(index>=0){const [x,z]=buildingPosition(index);desired.set(Math.sign(x)*7.6,3.2,z+3);cameraTarget.set(x,2.4,z);}else{const pose=safeCityCamera(position,cameraPreference);desired.set(...pose.position);cameraTarget.set(...pose.target);}}
        if(restoreOnce&&cameraPreference.actualPosition&&cameraPreference.actualTarget){camera.position.set(...cameraPreference.actualPosition);cameraTarget.set(...cameraPreference.actualTarget);restoreOnce=false;}else if(!lastTime||!motion)camera.position.copy(desired);else camera.position.lerp(desired,1-Math.exp(-dt*8));
        const entry=entranceFrame(entranceState,time-entranceStarted);world.entryGate.setOpen(entry.door);
        if(entranceState!=='INSIDE'){const endpoint=safeCityCamera(position,defaultCityCamera);camera.position.lerpVectors(new THREE.Vector3(0,5.7,61),new THREE.Vector3(...endpoint.position),entry.travel);cameraTarget.lerpVectors(new THREE.Vector3(0,5.1,43),new THREE.Vector3(...endpoint.target),entry.travel);camera.fov=44+13*entry.travel;}else camera.fov=57;
        camera.updateProjectionMatrix();camera.lookAt(cameraTarget);lastTime=time;renderer.render(scene,camera);
        const statistics=frameMonitor.sample(time,profile,(options.quality??'AUTO')==='AUTO');if(statistics){if(statistics.profile!==profile){profile=statistics.profile;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,graphicsProfiles[profile].pixelRatio));sunlight.shadow.map?.dispose();sunlight.shadow.map=null;sunlight.shadow.mapSize.set(graphicsProfiles[profile].shadowSize,graphicsProfiles[profile].shadowSize);viewportWidth=0;renderer.shadowMap.needsUpdate=true;}options.onStats?.(statistics);}
      },
      markers(){return view==='city'?projectCityMarkers(camera,world.markers):[];},
      resourceStatus(){return portalStatus;},
      frameInterval(){return 1000/graphicsProfiles[profile].fps;},
      door(key:string,open:boolean){const door=world.doors.get(key);if(!door)return false;door.target=Number(open);onInvalidate();return true;},
      presentation(state:AvatarState){context=state;onInvalidate();},
      approach(key:string|null){approached=key;onInvalidate();},
      entrance(state:EntranceState){if(state!==entranceState){entranceState=state;entranceStarted=performance.now();lastTime=0;onInvalidate();}},
      avatarShape(shape:DisplayBodyShape=neutralBodyShape){world.avatarRig.applyShape(shape);onInvalidate();},
      animated(){return entranceState==='OPENING'||[...world.doors.values()].some(door=>Math.abs(door.target-door.progress)>.002);},
      cameraSnapshot(){return {...cameraPreference,actualPosition:camera.position.toArray() as [number,number,number],actualTarget:cameraTarget.toArray() as [number,number,number]};},
      restoreCamera(value:CameraPreference){cameraPreference={...value};restoreOnce=!!value.actualPosition&&!!value.actualTarget&&[...value.actualPosition,...value.actualTarget].every(Number.isFinite);lastTime=0;onInvalidate();},
      orbit(horizontal:number,vertical:number){if(!Number.isFinite(horizontal)||!Number.isFinite(vertical))return;cameraPreference.orbit=Math.max(-Math.PI,Math.min(Math.PI,cameraPreference.orbit+horizontal));cameraPreference.lift=Math.max(-.6,Math.min(1.8,cameraPreference.lift+vertical));onInvalidate();},
      view(next:'city'|'church'){view=next;churchAngle=-.3;churchDistance=28;onInvalidate();},
      moveChurch(forward:number,turn:number,dt:number){churchAngle=Math.max(-.9,Math.min(.05,churchAngle+turn*dt*.8));churchDistance=Math.max(20,Math.min(36,churchDistance-forward*dt*5));},
      pick(x:number,y:number) {
        if(disposed)return null;scene.updateMatrixWorld(true);raycaster.setFromCamera(new THREE.Vector2(x*2-1,1-y*2),camera);
        const hit=raycaster.intersectObjects(world.entrances,true)[0];let object:THREE.Object3D|null=hit?.object??null;
        while(object){if(object.userData.buildingKey)return object.userData.buildingKey as string;object=object.parent;}return null;
      },
      natureTone(tone:'mixed'|'gold'|'silver'){for(const mesh of world.plantSurfaces)mesh.material=tone==='gold'?world.gold:tone==='silver'?world.silver:mesh.scale.x>.1?world.silver:world.gold;onInvalidate();},
      dispose(){if(disposed)return;disposed=true;disposeScene(scene);for(const texture of textures)texture.dispose();environment?.dispose();sunlight.shadow.dispose();renderer.dispose();renderer.forceContextLoss();},
    };
  } catch(error) {disposeScene(scene);for(const texture of textures)texture.dispose();environment?.dispose();renderer.dispose();renderer.forceContextLoss();throw error;}
}
