import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {museumStudy,type VisualStudy,type StudyKind} from './museum-studies';
import {disposeModelObjects} from './core-model-scene';
import {createSoftwareStudyStage} from './museum-study-software';

// Every shape is actual, editable presentation geometry. No physical dimensions are inferred.
export function buildStudyModel(visual:VisualStudy){
 const reference=museumStudy(visual.reference_id);if(!reference)throw Error('UNKNOWN_STUDY');
 const root=new THREE.Group();root.name=reference.title;
 root.userData={reference_id:reference.id,status:'CONCEPT',source:'MERGE_GEOMETRIC_STUDY',visual_configuration:{...visual},core_product_id:null,physical_dimensions:null,weight:null,manufacturing_ready:false};
 const gold=new THREE.MeshStandardMaterial({name:'Gold-tone visual finish · unverified',color:'#c6a360',metalness:.89,roughness:.25});
 const silver=new THREE.MeshStandardMaterial({name:'Silver-tone visual finish · unverified',color:'#bac7ce',metalness:.94,roughness:.23});
 const black=new THREE.MeshStandardMaterial({color:'#111820',metalness:.58,roughness:.32});
 const soft=new THREE.MeshStandardMaterial({color:visual.style==='sculptural'?'#243e3b':'#171a23',metalness:.42,roughness:.55});
 const glass=new THREE.MeshPhysicalMaterial({color:'#536c70',metalness:.2,roughness:.12,transparent:true,opacity:.72});
 const primary=visual.finish==='gold'?gold:silver,accent=visual.finish==='silver'?silver:gold;
 function part(geometry:THREE.BufferGeometry,mat:THREE.Material=primary,x=0,y=0,z=0,parent:THREE.Object3D=root){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);parent.add(m);return m;}
 const box=(w:number,h:number,d:number,x=0,y=0,z=0,mat:THREE.Material=primary)=>part(new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 const ball=(rx:number,ry:number,rz:number,x=0,y=0,z=0,mat:THREE.Material=primary)=>{const m=part(new THREE.SphereGeometry(1,24,16),mat,x,y,z);m.scale.set(rx,ry,rz);return m;};
 const cylinder=(r:number,h:number,x=0,y=0,z=0,mat:THREE.Material=primary,rt=r)=>part(new THREE.CylinderGeometry(rt,r,h,32),mat,x,y,z);
 const torus=(r:number,t:number,x=0,y=0,z=0,mat:THREE.Material=accent,arc=Math.PI*2)=>part(new THREE.TorusGeometry(r,t,8,48,arc),mat,x,y,z);
 function rod(a:number[],b:number[],r=.025,mat:THREE.Material=accent){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),length=start.distanceTo(end);const m=cylinder(r,length,0,0,0,mat);m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());return m;}
 function pipe(points:number[][],radius=.04,mat:THREE.Material=accent){return part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),40,radius,8,false),mat);}
 function profile(points:number[][],x=0,y=0,z=0,mat:THREE.Material=primary){return part(new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(p[0],p[1])),40),mat,x,y,z);}
 function silhouette(points:number[][],depth:number,mat:THREE.Material=primary){const s=new THREE.Shape(points.map(p=>new THREE.Vector2(p[0],p[1])));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035});g.translate(0,0,-depth/2);return part(g,mat);}
 const variant=visual.variation%9,form=visual.style==='sculptural'?1.12:visual.style==='minimal'?.9:1;
 const kind:StudyKind=reference.kind;
 if(kind==='guitar'||kind==='violin'){
  ball(.51,.58,.15,0,.6,0,primary);ball(.39,.4,.14,0,1.12,0,primary);ball(.38,.23,.18,0,.98,0,black);
  ball(.35,.5,.17,0,.62,.02,primary);ball(.3,.33,.17,0,1.14,.02,primary);
  box(.13,1.25,.13,0,1.93,.04,black);box(.24,.39,.12,0,2.66,.04,primary);box(.46,.055,.06,0,.42,.19,accent);
  if(kind==='guitar'){const sound=cylinder(.14,.015,0,.89,.174,black);sound.rotation.x=Math.PI/2;}
  else {torus(.12,.015,-.19,.97,.19,black,Math.PI);torus(.12,.015,.19,.97,.19,black,Math.PI).rotation.z=Math.PI;box(.11,.14,.055,0,.75,.2,black);}
  for(let i=0;i<6;i++){rod([-.053+i*.021,.44,.235],[-.053+i*.021,2.75,.155],.004,silver);ball(.045,.03,.035,i%2?.18:-.18,2.54+Math.floor(i/2)*.1,.04,accent);}
  for(let i=0;i<15;i++)box(.14,.009,.008,0,1.38+i*.072,.115,silver);
 }else if(kind==='harp'){
  cylinder(.67,.13,0,.07,0,black);pipe([[-.57,.14,0],[-.58,2.1,0],[.25,2.62,0],[.65,2.42,0],[.65,.15,0]],.09,primary);rod([-.57,.16,0],[.65,.16,0],.07,accent);
  for(let i=0;i<17;i++){const x=-.48+i*.063;rod([x,.18,0],[x,2.12+.38*Math.sin((i+1)/18*Math.PI),0],.006,silver);}
 }else if(kind==='flute'){
  cylinder(.12,2.7,0,1.4,0,primary);cylinder(.15,.11,0,.14,0,accent);cylinder(.15,.1,0,2.72,0,accent);
  for(let i=0;i<9;i++){const key=cylinder(.07,.055,.11,.45+i*.22,.06,accent);key.rotation.z=Math.PI/2;rod([.09,.45+i*.22,.06],[.2,.45+i*.22,.06],.02,silver);}
  torus(.125,.019,0,2.43,0,accent).rotation.x=Math.PI/2;
 }else if(kind==='trumpet'){
  pipe([[-.7,1.65,0],[-.2,1.65,0],[.43,1.65,0],[.56,1.25,0],[.1,1.04,0],[-.5,1.04,0],[-.65,.72,0],[-.37,.55,0],[.6,.55,0],[.75,1.3,0]],.095,primary);
  profile([[.09,0],[.1,.25],[.17,.45],[.32,.63],[.55,.76]],.75,1.25,0,primary);
  for(let i=0;i<3;i++){cylinder(.07,.6,-.28+i*.23,1.4,.13,silver);cylinder(.12,.04,-.28+i*.23,1.73,.13,accent);}
 }else if(kind==='piano'){
  const s=new THREE.Shape();s.moveTo(-1,0);s.lineTo(1,0);s.lineTo(1,1.1);s.bezierCurveTo(.9,2,-1,2,-1,.7);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.22,bevelEnabled:true,bevelSize:.04,bevelThickness:.03,bevelSegments:2});g.rotateX(Math.PI/2);g.translate(0,1.15,0);part(g,black);
  box(2.08,.2,.55,0,1.12,.04,primary);for(let i=0;i<24;i++){box(.075,.04,.42,-.94+i*.082,1.245,.04,silver);if(i%7!==2&&i%7!==6)box(.045,.07,.23,-.91+i*.082,1.28,-.04,black);}
  for(const [x,z]of[[-.8,.3],[.8,.3],[0,1.45]])rod([x,0,z],[x,1.1,z],.06,accent);const lid=box(1.93,.05,1.5,0,1.55,1,black);lid.rotation.x=-.32;rod([.78,1.22,.4],[.78,1.83,1.25],.022,accent);
 }else if(kind==='drum'){
  cylinder(.7,.85,0,.7,0,primary);cylinder(.71,.035,0,1.14,0,silver);cylinder(.71,.045,0,.27,0,accent);for(let i=0;i<10;i++){const a=i*Math.PI/5;rod([Math.cos(a)*.7,.29,Math.sin(a)*.7],[Math.cos(a)*.7,1.11,Math.sin(a)*.7],.025,accent);}rod([-.65,1.23,-.3],[.55,1.45,.1],.028,accent);rod([-.4,1.39,.3],[.6,1.25,-.2],.028,silver);
 }else if(kind==='dress'||kind==='jacket'){
  if(kind==='dress'){silhouette([[-.28,2.3],[-.58,2.07],[-.43,1.77],[-.27,1.35],[-.4,.92],[-.91,.08],[.91,.08],[.4,.92],[.27,1.35],[.43,1.77],[.58,2.07],[.28,2.3],[.17,2.06],[-.17,2.06]],.2,primary);for(let i=0;i<12;i++){const x=-.76+i*.139;rod([x,.12,.145],[x*.4,1.24,.145],.014,accent);}}
  else{silhouette([[-.2,2.2],[-.58,2.02],[-.97,1.06],[-.7,.91],[-.39,1.6],[-.42,.3],[.42,.3],[.39,1.6],[.7,.91],[.97,1.06],[.58,2.02],[.2,2.2],[0,1.73]],.3,primary);rod([0,.38,.2],[0,1.74,.2],.012,accent);for(let i=0;i<5;i++)ball(.024,.024,.025,.08,.62+i*.2,.2,accent);}
  torus(.18,.02,0,2.35,0,accent,Math.PI).rotation.z=Math.PI/2;
 }else if(kind==='shoe'){
  const m=ball(.9,.25,.35,.05,.38,0,primary);m.rotation.z=-.12;ball(.44,.4,.31,-.46,.53,0,soft);box(1.7,.11,.69,.02,.16,0,black);box(.36,.4,.55,-.56,.25,0,accent);for(let i=0;i<5;i++)rod([-.35+i*.14,.65-i*.035,.23],[-.35+i*.14,.65-i*.035,-.23],.018,silver);
 }else if(kind==='bag'||kind==='case'){
  if(kind==='case'){const m=cylinder(.96,.44,0,1.05,0,primary);m.rotation.x=Math.PI/2;torus(.94,.04,0,1.05,.235,accent);torus(.48,.035,0,2.02,0,black,Math.PI);box(.18,.13,.06,0,1.96,.25,accent);}
  else {const m=box(1.8,1.25,.62,0,.76,0,primary);m.scale.x=1+variant*.012;torus(.55,.065,0,1.7,0,accent,Math.PI);box(1.83,.09,.66,0,1.43,0,black);box(.24,.2,.06,0,1.13,.35,accent);for(const x of[-.62,.62])rod([x,.18,.33],[x,1.39,.33],.016,accent);}
 }else if(kind==='hat'){
  const brim=cylinder(1.12,.055,0,.17,0,primary);brim.scale.z=.75;cylinder(.63,.76,0,.56,0,primary,.55);cylinder(.64,.13,0,.29,0,black);torus(.6,.022,0,.38,0,accent).rotation.x=Math.PI/2;
 }else if(kind==='belt'){
  const b=torus(.85,.12,0,.99,0,black);b.scale.set(1.3,.65,.4);box(.58,.55,.12,0,1,.13,primary);box(.39,.36,.13,0,1,.2,black);rod([0,.83,.29],[0,1.21,.29],.018,accent);
 }else if(kind==='scarf'||kind==='curtain'||kind==='rug'||kind==='panel'){
  if(kind==='scarf'){pipe([[.5,2.4,0],[.68,2.1,.05],[.26,1.7,.1],[-.2,1.5,.15],[-.28,.14,.12]],.18,primary);pipe([[-.4,2.38,0],[-.58,2.11,-.03],[-.27,1.8,-.1],[.31,1.46,-.1],[.45,.43,-.1]],.18,accent);}
  else {const w=kind==='panel'?1.9:2.3,h=kind==='rug'?1.35:2.4;const geom=new THREE.PlaneGeometry(w,h,kind==='curtain'?36:1,kind==='curtain'?24:1);if(kind==='curtain'){const pos=geom.getAttribute('position');for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(pos.getX(i)*16)*.085);geom.computeVertexNormals();}const mesh=part(geom,primary,0,h/2+.1,0);(mesh.material as THREE.MeshStandardMaterial).side=THREE.DoubleSide;for(const x of[-w/2,w/2])rod([x,.09,.05],[x,h+.11,.05],.03,accent);rod([-w/2,.09,.05],[w/2,.09,.05],.03,accent);rod([-w/2,h+.11,.05],[w/2,h+.11,.05],.03,accent);}
 }else if(kind==='ring'||kind==='bracelet'||kind==='necklace'||kind==='earrings'||kind==='crown'){
  if(kind==='ring'){torus(.68,.1,0,.83,0,primary);const gem=part(new THREE.OctahedronGeometry(.29,0),silver,0,1.55,0);gem.rotation.z=Math.PI/4;for(const x of[-.22,.22])ball(.065,.065,.07,x,1.48,.03,accent);}
  if(kind==='bracelet'){const m=torus(.9,.14,0,1,0,primary);m.scale.y=.72;for(let i=0;i<20;i++){const a=i*Math.PI/10;ball(.07,.07,.08,Math.cos(a)*.9,1+Math.sin(a)*.65,.15,accent);}}
  if(kind==='necklace'){const m=torus(.75,.036,0,1.2,0,primary);m.scale.y=1.23;const gem=part(new THREE.OctahedronGeometry(.25,0),accent,0,.22,0);gem.scale.y=1.5;}
  if(kind==='earrings')for(const x of[-.45,.45]){torus(.31,.065,x,.81,0,primary);ball(.1,.1,.08,x,1.47,0,accent);rod([x,1.4,0],[x,1.15,0],.018,accent);}
  if(kind==='crown'){cylinder(.88,.23,0,.29,0,primary);for(let i=0;i<10;i++){const a=i*Math.PI/5,x=Math.cos(a),z=Math.sin(a),h=i%2?.93:1.17;const g=part(new THREE.ConeGeometry(.24,.7,4),primary,x*.78,.77,z*.78);g.rotation.y=-a;ball(.085,.085,.085,x*.78,h,z*.78,silver);}torus(.87,.04,0,.43,0,accent).rotation.x=Math.PI/2;}
 }else if(kind==='watch'||kind==='clock'){
  const face=cylinder(.67,.18,0,1.05,0,primary);face.rotation.x=Math.PI/2;const dial=cylinder(.585,.022,0,1.05,.103,black);dial.rotation.x=Math.PI/2;torus(.64,.035,0,1.05,.12,accent);
  if(kind==='watch'){for(const y of[.12,1.99])for(let i=0;i<5;i++)box(.54,.1,.16,0,y+(i-2)*.115,-.025,i%2?accent:primary);const c=cylinder(.08,.14,.77,1.05,0,accent);c.rotation.z=Math.PI/2;}
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const mark=box(.032,.085,.025,Math.sin(a)*.49,1.05+Math.cos(a)*.49,.136,silver);mark.rotation.z=-a;}
  rod([0,1.05,.155],[-.26,1.25,.155],.023,accent);rod([0,1.05,.16],[.32,1.32,.16],.015,silver);ball(.047,.047,.025,0,1.05,.177,accent);
 }else if(kind==='glasses'){
  for(const x of[-.55,.55]){const rim=torus(.43,.045,x,1.1,.1,primary);rim.scale.y=.72;const lens=part(new THREE.CircleGeometry(.4,32),glass,x,1.1,.09);lens.scale.y=.72;rod([x+(x<0?-.4:.4),1.17,.04],[x+(x<0?-.48:.48),1.15,-.9],.035,accent);}pipe([[-.14,1.17,.1],[0,1.24,.1],[.14,1.17,.1]],.028,accent);
 }else if(kind==='tree'||kind==='flower'){
  if(kind==='tree'){cylinder(.18,1.5,0,.75,0,primary,.08);for(let i=0;i<11;i++){const a=i*2.3999,y=.8+(i%4)*.35,x=Math.cos(a)*(.4+(i%3)*.16),z=Math.sin(a)*.5;rod([0,y-.25,0],[x,y+.4,z],.045,accent);ball(.44,.46,.32,x,y+.55,z,i%3?primary:accent);}}
  else{pipe([[0,.1,0],[.09,.8,0],[-.06,1.5,0],[0,2,0]],.035,primary);for(let i=0;i<10;i++){const a=i*Math.PI/5;const petal=ball(.22,.4,.07,Math.sin(a)*.25,2+Math.cos(a)*.25,.03,i%2?primary:accent);petal.rotation.z=-a;}ball(.17,.17,.14,0,2,.12,accent);for(const [x,y]of[[-.25,.8],[.26,1.3]]){const leaf=ball(.3,.11,.04,x,y,0,primary);leaf.rotation.z=x>0?.45:-.45;}}
 }else if(kind==='chair'||kind==='table'||kind==='sofa'||kind==='bed'||kind==='cabinet'){
  const wide=kind==='sofa'||kind==='bed'?2.3:kind==='table'?2.2:1.4,deep=kind==='bed'?2:kind==='sofa'?.85:1,seat=kind==='table'?1.2:.72;
  box(wide,.16,deep,0,seat,0,primary);for(const x of[-wide*.4,wide*.4])for(const z of[-deep*.4,deep*.4])rod([x,0,z],[x,seat-.05,z],.055,accent);
  if(kind==='chair'||kind==='sofa'||kind==='bed'){box(wide,.74,.15,0,seat+.44,-deep/2+.05,primary);box(wide*.91,.15,deep*.83,0,seat+.15,.02,soft);if(kind!=='bed')for(const x of[-wide/2,wide/2])box(.13,.4,deep,x,seat+.22,0,accent);}
  if(kind==='cabinet'){box(wide,1.6,deep,0,1.22,0,primary);for(const x of[-wide/4,wide/4]){box(wide/2-.05,1.45,.05,x,1.25,deep/2+.035,black);rod([x-.04,1.25,deep/2+.08],[x+.04,1.25,deep/2+.08],.025,accent);}}
 }else if(kind==='lamp'||kind==='chandelier'){
  if(kind==='lamp'){cylinder(.48,.08,0,.08,0,black);cylinder(.035,1.7,0,.94,0,accent);cylinder(.69,.65,0,1.92,0,primary,.3);}
  else{cylinder(.04,1.3,0,1.8,0,accent);torus(.7,.04,0,1.05,0,primary).rotation.x=Math.PI/2;for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*.92,z=Math.sin(a)*.92;pipe([[0,1.3,0],[x*.6,.6,z*.6],[x,1.1,z]],.035,accent);cylinder(.16,.22,x,1.18,z,primary);part(new THREE.OctahedronGeometry(.12,0),silver,x,.55,z);}}
 }else if(kind==='vase'||kind==='bath'||kind==='mirror'){
  if(kind==='vase')profile([[.36,0],[.4,.12],[.35,.42],[.59,.9],[.5,1.25],[.23,1.55],[.25,1.79],[.32,1.85]],0,.08,0,primary);
  else if(kind==='bath'){const m=ball(1.3,.43,.7,0,.6,0,primary);const bowl=ball(1.14,.06,.55,0,.92,0,black);bowl.rotation.z=.02;for(const x of[-.8,.8])for(const z of[-.38,.38])cylinder(.07,.3,x,.2,z,accent);pipe([[.92,.75,0],[.92,1.33,0],[.62,1.33,0],[.62,1.2,0]],.035,accent);m.scale.x=form;}
  else {const rim=torus(.85,.06,0,1.1,0,accent);rim.scale.y=1.25;const mirror=part(new THREE.CircleGeometry(.8,48),silver,0,1.1,0);mirror.scale.y=1.25;}
 }else if(kind==='robot'||kind==='doll'||kind==='teddy'||kind==='sculpture'){
  const round=kind==='teddy',angular=kind==='robot';
  if(angular){box(.69,.84,.42,0,1.25,0,primary);box(.56,.5,.45,0,1.98,0,primary);box(.42,.17,.025,0,2.02,.24,black);for(const x of[-.13,.13])ball(.043,.043,.02,x,2.02,.26,accent);}
  else {ball(round?.46:.34,round?.61:.56,.27,0,1.17,0,primary);ball(round?.36:.24,round?.34:.32,.24,0,1.98,0,primary);if(round)for(const x of[-.28,.28])ball(.15,.17,.12,x,2.24,0,accent);}
  for(const s of[-1,1]){rod([s*.22,.91,0],[s*.3,.21,.03],round?.15:.09,primary);ball(.18,.1,.26,s*.31,.13,.13,black);rod([s*.36,1.55,0],[s*.64,.88,.05],round?.16:.085,primary);ball(.11,.11,.11,s*.36,1.55,0,accent);}
 }else if(kind==='chess'){
  for(let x=0;x<8;x++)for(let z=0;z<8;z++)box(.24,.045,.24,(x-3.5)*.25,.045,(z-3.5)*.25,(x+z)%2?black:silver);
  for(let i=0;i<8;i++){const x=(i-3.5)*.25,mat=i%2?primary:accent;profile([[.09,0],[.09,.04],[.055,.08],[.04,.2],[.06,.24]],x,.08,-.87,mat);ball(.07,.07,.07,x,.37,-.87,mat);profile([[.09,0],[.08,.06],[.045,.22],[.085,.29],[.05,.39]],x,.08,.87,mat);if(i===3||i===4)rod([x,.42,.87],[x,.64,.87],.025,mat);}
 }else if(kind==='domino'||kind==='puzzle'||kind==='blocks'){
  for(let i=0;i<(kind==='domino'?6:9);i++){const x=(i%3-1)*.67,y=kind==='blocks'?Math.floor(i/3)*.43+.22:.09,z=(Math.floor(i/3)-1)*.56;const m=box(kind==='domino'?.42:.55,kind==='domino'?.1:kind==='blocks'?.4:.12,.48,x,y,z,i%2?primary:black);if(kind==='domino'){for(let p=0;p<i%5+1;p++)ball(.025,.012,.025,x+(p%2?-.1:.1),y+.065,z+(Math.floor(p/2)-1)*.1,accent);}m.rotation.y=i%2?.08:-.08;}
 }else if(kind==='pen'||kind==='notebook'){
  if(kind==='pen'){cylinder(.1,2.2,0,1.2,0,primary);part(new THREE.ConeGeometry(.105,.35,24),accent,0,2.48,0);rod([.12,.8,0],[.12,1.75,0],.021,accent);torus(.105,.015,0,.38,0,black).rotation.x=Math.PI/2;}
  else{box(1.5,2,.18,0,1.1,0,primary);box(1.34,1.88,.19,.04,1.1,0,silver);box(1.5,2,.03,0,1.1,.11,black);rod([-.61,.2,.14],[-.61,2,.14],.025,accent);}
 }else if(kind==='car'||kind==='motorcycle'||kind==='bicycle'){
  const bike=kind!=='car';for(const x of[-.9,.9])for(const z of bike?[0]:[-.46,.46]){const wheel=cylinder(bike?.42:.32,bike?.14:.18,x,.36,z,black);wheel.rotation.x=Math.PI/2;torus(bike?.32:.21,.025,x,.36,z+(bike?.08:Math.sign(z)*.1),accent);}
  if(!bike){box(2.37,.34,1.05,0,.68,0,primary);ball(.86,.39,.49,-.14,.95,0,primary);box(.65,.3,1.01,-.16,1.08,0,glass);for(const z of[-.37,.37])ball(.13,.06,.07,1.19,.73,z,silver);}
  else{for(const z of[-.045,.045]){rod([-.9,.36,z],[0,1.16,z],.045,primary);rod([0,1.16,z],[.3,.38,z],.045,primary);rod([.3,.38,z],[-.9,.36,z],.035,accent);rod([.3,.38,z],[.67,1.19,z],.035,primary);rod([.67,1.19,z],[.9,.36,z],.04,accent);rod([.67,1.19,z],[0,1.16,z],.035,primary);}box(.46,.08,.28,-.04,1.2,0,black);rod([.67,1.17,-.37],[.67,1.17,.37],.04,accent);if(kind==='motorcycle')ball(.42,.25,.21,.08,.91,0,primary);}
 }else if(kind==='boat'){
  const hull=ball(1.48,.41,.52,0,.5,0,primary);hull.scale.x=form;box(1.7,.06,.89,0,.75,0,black);box(.9,.42,.64,-.08,.98,0,primary);box(.6,.04,.8,-.1,1.22,0,accent);box(.5,.2,.65,-.02,1.09,0,glass);rod([-.5,1.2,0],[-.5,1.73,0],.022,accent);
 }else if(kind==='plane'){
  const fuselage=ball(.23,.24,1.57,0,.75,0,primary);fuselage.rotation.y=Math.PI/2;const wing=box(.7,.055,2.65,-.07,.77,0,primary);wing.rotation.z=.02;box(.54,.05,1.06,-1.1,.98,0,accent);const tail=box(.45,.54,.06,-1.12,1.12,0,primary);tail.rotation.z=.2;ball(.43,.16,.2,.47,.91,0,glass);
 }
 root.scale.set(form,1+(variant-4)*.018,visual.style==='minimal'?.92:1);root.updateMatrixWorld(true);
 addSelectiveMosaic(root,visual,accent,silver);
 return root;
}

function addSelectiveMosaic(root:THREE.Group,visual:VisualStudy,a:THREE.Material,b:THREE.Material){
 if(visual.style==='minimal')return;
 const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3());
 const columns=visual.mosaic==='fine'?30:visual.mosaic==='medium'?20:12,rows=Math.max(5,Math.min(40,Math.round(columns*size.y/Math.max(.1,size.x))));
 const width=size.x/columns*.66,height=size.y/rows*.66,geometry=new THREE.BoxGeometry(width,height,.012),limit=columns*rows;
 const tiles=[new THREE.InstancedMesh(geometry,a,limit),new THREE.InstancedMesh(geometry,b,limit)],counts=[0,0],ray=new THREE.Raycaster(),dummy=new THREE.Object3D(),normal=new THREE.Vector3(),normalMatrix=new THREE.Matrix3();
 const targets=root.children.filter(v=>(v as THREE.Mesh).isMesh);
 for(let x=0;x<columns;x++)for(let y=0;y<rows;y++){
  if((x*3+y+visual.variation)%5!==0&&(x+y*2+visual.variation)%11!==0)continue;
  ray.set(new THREE.Vector3(bounds.min.x+(x+.5)*size.x/columns,bounds.min.y+(y+.5)*size.y/rows,bounds.max.z+.5),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObjects(targets,false)[0];if(!hit?.face)continue;
  normal.copy(hit.face.normal).applyMatrix3(normalMatrix.getNormalMatrix(hit.object.matrixWorld)).normalize();if(normal.z<.35)continue;
  dummy.position.copy(root.worldToLocal(hit.point.clone().addScaledVector(normal,.011)));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);dummy.scale.setScalar(1);dummy.updateMatrix();
  const group=visual.finish==='mixed'?(x+y)%2:0;tiles[group].setMatrixAt(counts[group]++,dummy.matrix);
 }
 for(let i=0;i<2;i++){tiles[i].count=counts[i];tiles[i].name='Selective '+visual.mosaic+' mosaic · visual geometry';tiles[i].instanceMatrix.needsUpdate=true;root.add(tiles[i]);}
}

export function createStudyStage(canvas:HTMLCanvasElement,visual:VisualStudy){
 let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});}catch{return createSoftwareStudyStage(canvas,visual);}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#080c12');let model=buildStudyModel(visual),environment:THREE.WebGLRenderTarget|null=null;const display=new THREE.Group();scene.add(display);
 const plinth=new THREE.Mesh(new THREE.CylinderGeometry(1.55,1.65,.12,64),new THREE.MeshStandardMaterial({color:'#111923',metalness:.7,roughness:.3}));plinth.position.y=-.08;scene.add(plinth);const rim=new THREE.Mesh(new THREE.TorusGeometry(1.56,.012,8,64),new THREE.MeshStandardMaterial({color:'#c7aa71',metalness:.9,roughness:.3}));rim.rotation.x=Math.PI/2;rim.position.y=-.014;scene.add(rim);
 scene.add(new THREE.HemisphereLight('#d4e6fa','#34291d',2.5));for(const [color,x,y,z,intensity]of[['#ffe6b7',-3,4,4,4],['#bfd8f9',4,3,1,3],['#ffffff',0,4,-3,3]] as const){const light=new THREE.DirectionalLight(color,intensity);light.position.set(x,y,z);scene.add(light);}
 try{const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();}catch{/* Directional studio lighting remains available. */}
 const camera=new THREE.PerspectiveCamera(38,1,.05,100),orbit={yaw:.3,pitch:.13,distance:5.3};let disposed=false,w=0,h=0;
 function place(){const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),scale=2.45/Math.max(size.x,size.y,size.z);display.clear();model.position.sub(center);model.position.y+=size.y/2;display.add(model);display.scale.setScalar(scale);}
 place();
 return {mode:'WEBGL' as const,orbit,render(){if(disposed||renderer.getContext().isContextLost())return;const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);if(w!==width||h!==height){renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();w=width;h=height;}const d=orbit.distance*Math.max(1,.82/camera.aspect);camera.position.set(Math.sin(orbit.yaw)*Math.cos(orbit.pitch)*d,1.12+Math.sin(orbit.pitch)*d,Math.cos(orbit.yaw)*Math.cos(orbit.pitch)*d);camera.lookAt(0,1.15,0);renderer.render(scene,camera);},update(next:VisualStudy){if(disposed)return;display.remove(model);disposeModelObjects(model);model=buildStudyModel(next);place();},reset(){Object.assign(orbit,{yaw:.3,pitch:.13,distance:5.3});},async exportGLB(){const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');const result=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});if(!(result instanceof ArrayBuffer))throw Error('EXPORT_FAILED');return result;},dispose(){if(disposed)return;disposed=true;disposeModelObjects(scene);environment?.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
