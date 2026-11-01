import * as THREE from 'three';
export type EntranceState='CLOSED'|'OPENING'|'INSIDE';
export const ENTRANCE_DOOR_DURATION=3200;
export const ENTRANCE_OPEN_HOLD=1100;
export const ENTRANCE_TRAVEL_START=ENTRANCE_DOOR_DURATION+ENTRANCE_OPEN_HOLD;
export const ENTRANCE_DURATION=ENTRANCE_TRAVEL_START+3200;
export const ENTRANCE_RELEASE_DURATION=1100;
// Founder-selected order: exact closed image 1 → exact open image 2 → retained city.
// The earlier open reference remains archived as founder-entry-open.png.
export const entranceReferences=Object.freeze({closed:'/museum-v78/assets/founder-entry-closed.png',open:'/museum-v78/assets/founder-entry-open-approved.png',city:'/museum-v78/assets/founder-brand-megapolis.png'});
const ease=(n:number)=>{const v=Math.max(0,Math.min(1,n));return v*v*(3-2*v);};
export function entranceFrame(state:EntranceState,elapsed:number){
 const time=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
 return {door:state==='INSIDE'?1:state==='CLOSED'?0:ease(time/ENTRANCE_DOOR_DURATION),travel:state==='INSIDE'?1:state==='CLOSED'?0:ease((time-ENTRANCE_TRAVEL_START)/(ENTRANCE_DURATION-ENTRANCE_TRAVEL_START)),complete:state==='INSIDE'||state==='OPENING'&&time>=ENTRANCE_DURATION};
}
// Actual, thick, separately hinged 3D leaves. The approved image supplies its
// original ornament/lettering pixels; it is not a replacement logo or product.
export function buildMegapolisEntrance(gold:THREE.Material,stone:THREE.Material){
 const root=new THREE.Group();root.name='Approved city entrance · articulated 3D';root.position.set(0,5.5,43);root.userData.displayScale='EXHIBITION_ONLY';
 const faces:THREE.MeshStandardMaterial[]=[];
 const leaves=[-1,1].map(side=>{
  const shape=new THREE.Shape(),start=side<0?Math.PI/2:-Math.PI/2;
  for(let i=0;i<=64;i++){const a=start+i*Math.PI/64,x=Math.cos(a)*5,y=Math.sin(a)*5;if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);}shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.2,bevelEnabled:true,bevelThickness:.045,bevelSize:.045,bevelSegments:2,curveSegments:48});
  const positions=geometry.getAttribute('position'),uv=geometry.getAttribute('uv');
  for(let i=0;i<positions.count;i++)uv.setXY(i,.5+positions.getX(i)*.052, .54+positions.getY(i)*.073);
  uv.needsUpdate=true;
  const face=new THREE.MeshStandardMaterial({color:'#f8e2b0',metalness:.35,roughness:.32});faces.push(face);
  const mesh=new THREE.Mesh(geometry,[face,gold]);mesh.position.x=-side*5;mesh.castShadow=true;mesh.receiveShadow=true;mesh.name=side<0?'Approved gold left leaf':'Approved silver right leaf';
  const hinge=new THREE.Group();hinge.position.x=side*5;hinge.add(mesh);root.add(hinge);return hinge;
 });
 const ring=new THREE.Mesh(new THREE.TorusGeometry(5.16,.065,8,96),gold);root.add(ring);
 for(const side of [-1,1]){
  const pylon=new THREE.Mesh(new THREE.BoxGeometry(2.3,18,3),stone);pylon.position.set(side*8.4,3,-.4);pylon.castShadow=true;root.add(pylon);
  for(const edge of [-.95,.95]){const trim=new THREE.Mesh(new THREE.BoxGeometry(.055,18.1,3.05),gold);trim.position.set(side*8.4+edge,3,-.4);root.add(trim);}
  for(const y of [-3.7,-1.3,1.3,3.7]){const pin=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.8,12),gold);pin.position.set(side*5.2,y,0);root.add(pin);}
 }
 return {root,leaves,faces,setOpen(amount:number){const v=Math.max(0,Math.min(1,Number.isFinite(amount)?amount:0));leaves[0].rotation.y=-v*1.64;leaves[1].rotation.y=v*1.64;}};
}
