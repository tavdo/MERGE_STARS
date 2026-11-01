import * as THREE from 'three';
import {photoInterfaceMasks,photoMegapolis,photoMotionRegions,type PhotoMotionKind} from './photo-megapolis.ts';
const field=(kind:PhotoMotionKind)=>photoMotionRegions.filter(region=>region.kind===kind).map(region=>`area(p,vec4(${region.bounds.map(n=>n.toFixed(6)).join(',')}),${region.feather.toFixed(6)})`).join('+')||'0.0';

// A single photographic plane with small, local optical animation. There is
// deliberately no claim of reconstructed buildings, a walking rig, or 3D fit.
export const photoFragmentShader=`
uniform sampler2D uPhoto;
uniform float uTime;
uniform float uMotion;
varying vec2 vUv;
float area(vec2 p,vec4 r,float feather){
 return smoothstep(r.x-feather,r.x+feather,p.x)*(1.0-smoothstep(r.z-feather,r.z+feather,p.x))*smoothstep(r.y-feather,r.y+feather,p.y)*(1.0-smoothstep(r.w-feather,r.w+feather,p.y));
}
void main(){
 vec2 p=vec2(vUv.x,1.0-vUv.y),q=p;
 float t=uTime;
 float hair=${field('hair')};
 float figure=${field('figure')};
 float cape=${field('cape')};
 // The original avatar pixels breathe; no cutout is passed off as a model.
 q.x+=uMotion*(sin(t*.9+p.y*23.0)*.0015*hair+sin(t*1.45)*.0004*figure+sin(p.y*39.0-t*1.4)*.0021*cape);
 q.y+=uMotion*(cos(t*1.45)*.00045*(hair+figure)+sin(p.x*35.0+t)*.0009*cape);
 float falls=${field('falls')};
 float pools=${field('pool')};
 float reflections=${field('reflection')};
 float islands=${field('island')};
 q.x+=uMotion*.0012*sin(p.y*590.0-t*3.1)*falls;
 q.y+=uMotion*(.00075*sin(p.y*420.0-t*5.4)*falls+.00065*sin(p.x*210.0+t*1.6)*pools+.0004*sin(t*.55)*islands);
 vec4 color=texture2D(uPhoto,vec2(q.x,1.0-q.y));
 float glint=uMotion*(.5+.5*sin(t*1.2+p.x*41.0))*.038*(pools+reflections);
 color.rgb+=vec3(.92,.70,.36)*glint;
 // A moving highlight follows the pictured globe, without inventing a model.
 vec2 orb=(p-vec2(.509,.379))/vec2(.037,.052);float radius=length(orb);
 float orbLight=(1.0-smoothstep(.82,1.13,radius))*(.5+.5*sin(atan(orb.y,orb.x)*2.0-t*.65));
 color.rgb+=uMotion*vec3(.07,.042,.012)*orbLight;
 // Sparse atmospheric light over water, not visitor/online-count data.
 for(int i=0;i<12;i++){float n=float(i);vec2 dust=vec2(.2+fract(n*.618)*.59,.54+fract(n*.271+t*.013)*.29);float light=exp(-dot((p-dust)*vec2(1.0,1.5),(p-dust)*vec2(1.0,1.5))*280000.0);color.rgb+=uMotion*light*vec3(.075,.047,.014);}
 // Even a canvas-only frame never exposes the reference's fictitious prices.
 ${photoInterfaceMasks.map(mask=>`if(p.x>=${mask.x.toFixed(6)}&&p.x<=${(mask.x+mask.w).toFixed(6)}&&p.y>=${mask.y.toFixed(6)}&&p.y<=${(mask.y+mask.h).toFixed(6)})color=vec4(.0052,.0080,.0123,1.0);`).join('\n')}
 gl_FragColor=color;
 #include <colorspace_fragment>
}`;
export function createPhotoMegapolisRenderer(canvas:HTMLCanvasElement,invalidate:()=>void,onError:()=>void){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,2);camera.position.z=1;
 let disposed=false,ready=false,width=0,height=0;
 const texture=new THREE.TextureLoader().load(photoMegapolis.image,()=>{if(disposed){texture.dispose();return;}ready=true;invalidate();},undefined,()=>{if(!disposed)onError();});texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.ShaderMaterial({uniforms:{uPhoto:{value:texture},uTime:{value:0},uMotion:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:photoFragmentShader,depthTest:false,depthWrite:false,transparent:true});
 const geometry=new THREE.PlaneGeometry(2,2);scene.add(new THREE.Mesh(geometry,material));
 return {
  render(time:number,motion:boolean){if(disposed||!ready||renderer.getContext().isContextLost())return false;const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);if(w!==width||h!==height){renderer.setSize(w,h,false);width=w;height=h;}material.uniforms.uTime.value=time;material.uniforms.uMotion.value=motion?1:0;renderer.render(scene,camera);return true;},
  dispose(){disposed=true;geometry.dispose();material.dispose();texture.dispose();scene.clear();renderer.dispose();renderer.forceContextLoss();},
 };
}
