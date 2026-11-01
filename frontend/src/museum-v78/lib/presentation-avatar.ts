import * as THREE from 'three';
import { gaitTarget, type AvatarMotion } from './megapolis-motion.ts';
import { graphicsProfiles, type GraphicsProfile } from './megapolis-quality.ts';
import { neutralBodyShape, type DisplayBodyShape } from './fit-measurements.ts';

export type AvatarPresentation='woman'|'man';

// Faceless, clothed presentation geometry. User-entered proportions are a
// bounded visual illustration, never a certified body scan or production fit.
export function buildPresentationAvatar(choice:AvatarPresentation,quality:GraphicsProfile='HIGH') {
 const detail=graphicsProfiles[quality].segments;
 const root=new THREE.Group();root.name=`Faceless ${choice} mannequin`;
 root.userData={presentation:choice,displayScale:'EXHIBITION_ONLY',geometryOrigin:'PROCEDURAL_PRESENTATION',faceless:true,hasVerifiedMeasurements:false};
 const sphere=new THREE.SphereGeometry(1,detail,Math.max(10,Math.floor(detail*.65)));
 const suit=new THREE.MeshPhysicalMaterial({color:choice==='woman'?'#d9dbd5':'#b5c3cb',metalness:.5,roughness:.3,clearcoat:.65,clearcoatRoughness:.22});
 const gold=new THREE.MeshStandardMaterial({color:'#d4ac69',metalness:.93,roughness:.25});
 const silver=new THREE.MeshStandardMaterial({color:'#cdd5df',metalness:.92,roughness:.26});
 const smooth=new THREE.MeshPhysicalMaterial({color:'#c9cfd0',metalness:.68,roughness:.24,clearcoat:.5});
 function oval(parent:THREE.Object3D,name:string,position:readonly[number,number,number],size:readonly[number,number,number],material:THREE.Material){const mesh=new THREE.Mesh(sphere,material);mesh.name=name;mesh.position.set(...position);mesh.scale.set(...size);mesh.castShadow=true;parent.add(mesh);return mesh;}
 const body=new THREE.Group();body.name='Neutral fitted bodysuit';root.add(body);
 const points=choice==='woman'?[[.19,.89],[.205,.98],[.157,1.1],[.18,1.24],[.235,1.39],[.205,1.45],[.09,1.49]]:[[.205,.89],[.215,.98],[.195,1.1],[.245,1.25],[.265,1.4],[.225,1.46],[.09,1.49]];
 const torsoGeometry=new THREE.LatheGeometry(points.map(([x,y])=>new THREE.Vector2(x,y)),detail);
 const torso=new THREE.Mesh(torsoGeometry,suit);torso.name='Smooth body proportions';torso.scale.z=.72;torso.castShadow=true;body.add(torso);
 const originalTorso=new Float32Array(torsoGeometry.getAttribute('position').array);
 const belt=new THREE.Mesh(new THREE.TorusGeometry(choice==='woman'?.165:.205,.012,6,detail),gold);belt.rotation.x=Math.PI/2;belt.scale.y=.72;belt.position.y=1.08;body.add(belt);
 const neck=oval(body,'Neutral covered neck',[0,1.52,0],[.075,.1,.074],smooth);
 const head=new THREE.Group();head.name='Smooth anonymous head · no facial features';head.position.y=1.72;root.add(head);
 oval(head,'Faceless head',[0,0,0],[.155,.213,.155],smooth);
 const badge=new THREE.Mesh(new THREE.PlaneGeometry(.06,.06),new THREE.MeshBasicMaterial({color:'#e0c487',toneMapped:false}));badge.name='Official MERGE badge';badge.position.set(-.14,1.32,-.174);body.add(badge);
 const segmentGeometry=new THREE.CapsuleGeometry(1,1,6,Math.max(10,detail-6));
 function segment(parent:THREE.Object3D,length:number,radius:number){const mesh=new THREE.Mesh(segmentGeometry,suit);mesh.position.y=-length/2;mesh.scale.set(radius,length/3,radius);mesh.castShadow=true;parent.add(mesh);return mesh;}
 const legs=[-1,1].map(side=>{
  const hip=new THREE.Group();hip.position.set(side*.119,.98,0);root.add(hip);const thigh=segment(hip,.43,choice==='woman'?.078:.086);
  const knee=new THREE.Group();knee.position.y=-.43;hip.add(knee);const calf=segment(knee,.43,.062);
  const ankle=new THREE.Group();ankle.position.y=-.43;knee.add(ankle);
  const foot=oval(ankle,'Neutral fitted shoe',[0,-.025,-.065],[.079,.046,.157],suit);
  const sole=oval(ankle,'Shoe sole',[0,-.056,-.057],[.082,.013,.157],side<0?gold:silver);
  return {hip,knee,ankle,foot,sole,thigh,calf};
 });
 const arms=[-1,1].map(side=>{
  const shoulder=new THREE.Group();shoulder.position.set(side*.29,1.425,0);body.add(shoulder);segment(shoulder,.3,.057);
  const elbow=new THREE.Group();elbow.position.y=-.3;shoulder.add(elbow);const forearm=segment(elbow,.29,.045);
  oval(elbow,'Covered hand',[0,-.322,0],[.035,.06,.026],suit);
  for(let i=0;i<5;i++)oval(elbow,'Finger '+i,[(i-2)*.012,-.371-Math.sin(i*.8)*.006,0],[.007,.029,.009],suit);
  const cuff=new THREE.Mesh(new THREE.TorusGeometry(.044,.007,6,12),side<0?gold:silver);cuff.rotation.x=Math.PI/2;cuff.position.y=-.278;elbow.add(cuff);
  return {shoulder,elbow,forearm,cuff};
 });
 let shape={...neutralBodyShape},walkingBlend=0;
 function applyShape(value:DisplayBodyShape){
  const next={...neutralBodyShape};for(const key of Object.keys(next) as (keyof DisplayBodyShape)[]){const n=value[key];next[key]=Number.isFinite(n)?Math.max(.35,Math.min(1.5,n)):1;}shape=next;
  const positions=torsoGeometry.getAttribute('position');
  for(let i=0;i<positions.count;i++){
   const y=originalTorso[i*3+1];let width=y<1.03?shape.hips:y<1.17?shape.waist:y<1.38?shape.chest:shape.shoulders;
   positions.setXYZ(i,originalTorso[i*3]*width,y,originalTorso[i*3+2]*width);
  }
  positions.needsUpdate=true;torsoGeometry.computeVertexNormals();torsoGeometry.computeBoundingSphere();
  const pelvis=.86*(shape.leg-1);body.position.y=pelvis;head.position.y=1.72+pelvis;head.scale.set(shape.head,1,shape.head);neck.scale.set(.075*shape.neck,.1,.074*shape.neck);
  root.scale.y=shape.height*1.94/(1.94+pelvis);
  belt.scale.set(shape.waist,.72*shape.waist,1);
  for(let i=0;i<arms.length;i++){arms[i].shoulder.position.x=(i?1:-1)*.29*shape.shoulders;arms[i].shoulder.scale.y=shape.arm;const wrist=i?shape.rightWrist:shape.leftWrist;arms[i].forearm.scale.x=.045*wrist;arms[i].forearm.scale.z=.045*wrist;arms[i].cuff.scale.set(wrist,wrist,1);}
  for(let i=0;i<legs.length;i++){legs[i].hip.position.x=(i?1:-1)*.119*shape.hips;legs[i].knee.position.y=-.43*shape.leg;legs[i].ankle.position.y=-.43*shape.leg;for(const segment of [legs[i].thigh,legs[i].calf]){segment.scale.y=.43/3*shape.leg;segment.position.y=-.43/2*shape.leg;}const footSize=i?shape.rightFoot:shape.leftFoot;legs[i].foot.scale.z=.157*footSize;legs[i].sole.scale.z=.157*footSize;const width=i?shape.rightFootWidth:shape.leftFootWidth;legs[i].foot.scale.x=.079*width;legs[i].sole.scale.x=.082*width;}
  root.userData.proportionsSource='USER_ENTERED_PREVIEW';
 }
 function pose(state:AvatarMotion,seconds:number,ambientMotion:boolean){
  const dt=Math.max(0,Math.min(.05,seconds)),walking=state.state==='WALK';walkingBlend+=(Number(walking)-walkingBlend)*(1-Math.exp(-dt*12));
  for(let i=0;i<legs.length;i++){
   const target=gaitTarget(state.distance,i as 0|1,.62*shape.leg),z=target.z*walkingBlend,y=(-.86+.07*walkingBlend)*shape.leg+target.lift*walkingBlend;legs[i].hip.position.y=.12+(.86-.07*walkingBlend)*shape.leg;
   const distance=Math.max(.04,Math.min(.859*shape.leg,Math.hypot(z,y))),base=Math.atan2(-z,-y),offset=Math.acos(Math.max(-1,Math.min(1,distance/(2*.43*shape.leg))));
   legs[i].hip.rotation.x=base+offset;legs[i].knee.rotation.x=-2*offset;legs[i].ankle.rotation.x=-(base-offset);
   const phase=state.distance/.62*Math.PI+i*Math.PI;arms[i].shoulder.rotation.x=-Math.sin(phase)*.27*walkingBlend;arms[i].elbow.rotation.x=-.12-Math.max(0,-Math.sin(phase))*.17*walkingBlend;
  }
  body.scale.y=1+(ambientMotion?Math.sin(state.elapsed*1.8)*.002:0);
  head.rotation.y=state.state==='TURN_LEFT'?.12:state.state==='TURN_RIGHT'?-.12:0;
  if(state.state==='INSPECT_PRODUCT'||state.state==='OPEN_DOOR'){arms[1].shoulder.rotation.x=-.48;arms[1].elbow.rotation.x=-.42;}
 }
 pose({state:'IDLE',previous:'IDLE',elapsed:0,distance:0},0,false);
 return {root,pose,applyShape,badge,legs:legs.map(l=>l.hip),arms:arms.map(a=>a.shoulder)};
}
