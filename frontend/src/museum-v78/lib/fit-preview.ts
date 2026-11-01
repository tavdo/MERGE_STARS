import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildPresentationAvatar, type AvatarPresentation } from './presentation-avatar.ts';
import { measurementFields, neutralBodyShape, type DisplayBodyShape } from './fit-measurements.ts';
export type BodyMarker={id:string;x:number;y:number;visible:boolean};
const markerIds=new Set(['height','head','shoulders','chest','waist','hips','wrist_left','wrist_right','leg','foot_left_length','foot_right_length']);
export function createFitPreview(canvas:HTMLCanvasElement,presentation:AvatarPresentation,onMarkers:(markers:BodyMarker[])=>void){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#111820');
 const camera=new THREE.PerspectiveCamera(35,1,.1,30);let distance=4,angle=Math.PI,disposed=false,shape={...neutralBodyShape},frame:number|null=null;
 const avatar=buildPresentationAvatar(presentation,'BALANCED');scene.add(avatar.root);
 scene.add(new THREE.HemisphereLight('#e6edf3','#59462f',2));const light=new THREE.DirectionalLight('#fff1d0',3);light.position.set(-3,5,4);scene.add(light);const rim=new THREE.DirectionalLight('#bbd7f5',2);rim.position.set(2,3,-3);scene.add(rim);
 const ground=new THREE.Mesh(new THREE.CylinderGeometry(.65,.72,.06,48),new THREE.MeshStandardMaterial({color:'#34444e',metalness:.72,roughness:.24}));ground.position.y=-.015;scene.add(ground);
 const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const environment=generator.fromScene(room,.08);scene.environment=environment.texture;room.dispose();generator.dispose();
 function draw(){frame=null;if(disposed||renderer.getContext().isContextLost())return;const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();camera.position.set(0,1.13,distance);camera.lookAt(0,1.02,0);avatar.root.rotation.y=angle;avatar.root.updateMatrixWorld(true);renderer.render(scene,camera);
  onMarkers(measurementFields.filter(f=>markerIds.has(f.id)).map(f=>{const v=new THREE.Vector3(...f.anchor);if(v.y>.88)v.y+=.86*(shape.leg-1);else v.y*=shape.leg;v.applyMatrix4(avatar.root.matrixWorld);v.project(camera);return {id:f.id,x:(v.x+1)*50,y:(1-v.y)*50,visible:Math.abs(v.x)<.95&&Math.abs(v.y)<.97&&v.z<1};}));
 }
 function invalidate(){if(!disposed&&frame===null)frame=requestAnimationFrame(draw);}
 const resize=new ResizeObserver(invalidate);resize.observe(canvas);invalidate();
 return {shape(value:DisplayBodyShape){shape=value;avatar.applyShape(value);avatar.pose({state:'IDLE',previous:'IDLE',elapsed:0,distance:0},0,false);invalidate();},orbit(delta:number){if(Number.isFinite(delta)){angle+=delta;invalidate();}},zoom(delta:number){if(Number.isFinite(delta)){distance=Math.max(2.9,Math.min(5.6,distance+delta));invalidate();}},dispose(){if(disposed)return;disposed=true;if(frame!==null)cancelAnimationFrame(frame);resize.disconnect();const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)geometries.add(m.geometry);if(m.material)for(const v of Array.isArray(m.material)?m.material:[m.material])materials.add(v);});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();environment.dispose();scene.clear();renderer.dispose();renderer.forceContextLoss();}};
}
