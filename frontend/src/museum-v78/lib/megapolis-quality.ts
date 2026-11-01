export const graphicsProfiles={
  ULTRA:{label:'Ultra',pixelRatio:2,shadowSize:2048,fps:60,segments:32},
  HIGH:{label:'High',pixelRatio:1.7,shadowSize:2048,fps:60,segments:26},
  BALANCED:{label:'Balanced',pixelRatio:1.3,shadowSize:1024,fps:30,segments:20},
  PERFORMANCE:{label:'Performance',pixelRatio:1,shadowSize:512,fps:30,segments:14},
} as const;
export type GraphicsProfile=keyof typeof graphicsProfiles;
export type GraphicsChoice=GraphicsProfile|'AUTO';
export function initialGraphics(input:{maxTexture:number;cores:number;memory:number;mobile:boolean}):GraphicsProfile {
  if(input.maxTexture<4096||input.cores<4||input.memory>0&&input.memory<4)return 'PERFORMANCE';
  if(input.mobile||input.cores<8||input.memory>0&&input.memory<8)return 'BALANCED';
  return 'HIGH';
}
export function safeGraphics(choice:GraphicsChoice,capabilities:Parameters<typeof initialGraphics>[0]):GraphicsProfile {
  const initial=initialGraphics(capabilities);
  if(choice==='AUTO')return initial;
  if(!Object.hasOwn(graphicsProfiles,choice))return initial;
  if(capabilities.maxTexture<4096)return 'PERFORMANCE';
  if(initial==='PERFORMANCE')return 'PERFORMANCE';
  if(choice==='ULTRA'&&(capabilities.mobile||capabilities.memory>0&&capabilities.memory<8))return 'HIGH';
  return choice;
}
export function lowerGraphics(profile:GraphicsProfile):GraphicsProfile {
  return profile==='ULTRA'?'HIGH':profile==='HIGH'?'BALANCED':'PERFORMANCE';
}
export function createFrameMonitor(){
  let last=0,start=0,count=0,slow=0;
  return {sample(time:number,profile:GraphicsProfile,automatic:boolean){
    if(!Number.isFinite(time))return null;
    if(!last||time-last>250||time<last){last=time;start=time;count=0;return null;}
    last=time;count++;
    if(time-start<1200)return null;
    const fps=Math.round(count*1000/(time-start));start=time;count=0;
    slow=fps<graphicsProfiles[profile].fps*.67?slow+1:0;
    const next=(automatic||fps<15)&&slow>=3?lowerGraphics(profile):profile;if(next!==profile)slow=0;
    return {fps,profile:next};
  },reset(){last=0;start=0;count=0;slow=0;}};
}
