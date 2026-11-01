import type { CityPosition } from './megapolis-domain.ts';

// Presentation state only. No state in this module can authorize a CORE action.
export type AvatarState = 'IDLE'|'WALK'|'TURN_LEFT'|'TURN_RIGHT'|'STOP'|'OPEN_DOOR'|'ENTER_HOUSE'|'INSPECT_PRODUCT'|'RETURN';
export type AvatarMotion = { state: AvatarState; previous: AvatarState; elapsed: number; distance: number };
export const idleAvatar = (): AvatarMotion => ({state:'IDLE',previous:'IDLE',elapsed:0,distance:0});
export function advanceAvatar(current: AvatarMotion, input: {distance:number;turn:number;seconds:number;context?:AvatarState}): AvatarMotion {
  const dt=Number.isFinite(input.seconds)?Math.max(0,Math.min(.05,input.seconds)):0;
  const delta=Number.isFinite(input.distance)?Math.max(0,Math.min(.5,input.distance)):0;
  const context=input.context;
  let state:AvatarState=context&&['OPEN_DOOR','ENTER_HOUSE','INSPECT_PRODUCT','RETURN'].includes(context)?context:delta>.0001?'WALK':input.turn<-.01?'TURN_LEFT':input.turn>.01?'TURN_RIGHT':current.state==='WALK'||current.state==='STOP'&&current.elapsed<.18?'STOP':'IDLE';
  return {state,previous:state===current.state?current.previous:current.state,elapsed:state===current.state?current.elapsed+dt:0,distance:current.distance+delta};
}
export function gaitTarget(distance:number,side:0|1,stride=.62) {
  const phase=(((Number.isFinite(distance)?distance:0)/Math.max(.3,stride)*Math.PI+side*Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
  const stance=phase<Math.PI,t=stance?phase/Math.PI:(phase-Math.PI)/Math.PI;
  return {z:stance?-stride/2+stride*t:stride/2-stride*(t*t*(3-2*t)),lift:stance?0:Math.sin(t*Math.PI)*.095*stride/.62,stance};
}
export type CameraPreference = { orbit:number; lift:number; distance:number; actualPosition?:readonly[number,number,number]; actualTarget?:readonly[number,number,number] };
export const defaultCityCamera:CameraPreference={orbit:0,lift:0,distance:5.4};
export function safeCityCamera(position:CityPosition,preference:CameraPreference) {
  const safe=Number.isFinite(preference.orbit)&&Number.isFinite(preference.lift)&&Number.isFinite(preference.distance)?preference:defaultCityCamera;
  const angle=position.yaw+Math.max(-Math.PI,Math.min(Math.PI,safe.orbit));
  const distance=Math.max(3.3,Math.min(7,safe.distance));
  // The camera stays inside the open boulevard, outside House footprints and palace walls.
  const cameraX=Math.max(-8.9,Math.min(8.9,position.x+Math.sin(angle)*distance));let cameraZ=Math.max(-41,Math.min(47,position.z+Math.cos(angle)*distance));
  // Keep the follow camera inside the new gate pylons at the boulevard edge.
  if(Math.abs(cameraX)>6&&cameraZ>40.5)cameraZ=40.5;
  return {position:[cameraX,3.05+Math.max(-.6,Math.min(1.8,safe.lift)),cameraZ] as const,target:[position.x-Math.sin(position.yaw)*2.6,1.8,position.z-Math.cos(position.yaw)*2.6] as const};
}
export function snapshotReturn(position:CityPosition,camera:CameraPreference) {
  return {position:{...position},camera:{...camera}};
}
