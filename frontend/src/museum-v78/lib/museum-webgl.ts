import {cameraBasis, spatialExhibits, spatialNodes,  type SpatialCamera, type SpatialExhibit, type Vec3} from './museum-spatial.ts';
import {interiorReference,interiorPanels,frontFacades,centralMedallion,museumFloralDisplays,medallionCrop,museumLensShift,museumLensLift,museumPresentationFov} from './museum-interior.ts';
import {displayShape,displayYaw,triangulateOutline,pickMuseumExhibit,pickMuseumNode,navigationTarget,type Outline} from './museum-display.ts';
import {museumPresentationAsset} from './museum-assets.ts';
export type MeshData={vertices:Float32Array;};
// Render-only geometry: no measured product dimensions, density, weight or commerce data.
export class Geometry {
 values:number[]=[];
 triangle(a:Vec3,b:Vec3,c:Vec3,color:Vec3,glow=0,uv:readonly number[]=[0,0,1,0,1,1]){
  const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const d=Math.hypot(...n)||1;n=n.map(x=>x/d);
  [a,b,c].forEach((p,i)=>this.values.push(...p,...n,...color,glow,uv[i*2],uv[i*2+1]));
 }
 quad(a:Vec3,b:Vec3,c:Vec3,d:Vec3,color:Vec3,glow=0,uv:readonly [number,number,number,number]=[0,0,1,1]){const [l,t,r,bottom]=uv;this.triangle(a,b,c,color,glow,[l,1-bottom,r,1-bottom,r,1-t]);this.triangle(a,c,d,color,glow,[l,1-bottom,r,1-t,l,1-t]);}
 box(x:number,y:number,z:number,w:number,h:number,d:number,color:Vec3,glow=0){const p:Vec3[]=[[-w/2,-h/2,-d/2],[w/2,-h/2,-d/2],[w/2,h/2,-d/2],[-w/2,h/2,-d/2],[-w/2,-h/2,d/2],[w/2,-h/2,d/2],[w/2,h/2,d/2],[-w/2,h/2,d/2]].map(p=>[p[0]+x,p[1]+y,p[2]+z]);for(const f of [[4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[3,7,6,2],[0,1,5,4]])this.quad(p[f[0]],p[f[1]],p[f[2]],p[f[3]],color,glow);}
 cylinder(x:number,y:number,z:number,r:number,h:number,color:Vec3,glow=0,sides=32){for(let i=0;i<sides;i++){const a=i/sides*Math.PI*2,b=(i+1)/sides*Math.PI*2;const p:Vec3=[x+r*Math.cos(a),y,z+r*Math.sin(a)],q:Vec3=[x+r*Math.cos(b),y,z+r*Math.sin(b)];this.quad(p,q,[q[0],y+h,q[2]],[p[0],y+h,p[2]],color,glow);this.triangle([x,y+h,z],[p[0],y+h,p[2]],[q[0],y+h,q[2]],color,glow);}}
 ring(x:number,y:number,z:number,inner:number,outer:number,color:Vec3,glow=0,sides=96){for(let i=0;i<sides;i++){const a=i/sides*Math.PI*2,b=(i+1)/sides*Math.PI*2;this.quad([x+inner*Math.cos(a),y,z+inner*Math.sin(a)],[x+inner*Math.cos(b),y,z+inner*Math.sin(b)],[x+outer*Math.cos(b),y,z+outer*Math.sin(b)],[x+outer*Math.cos(a),y,z+outer*Math.sin(a)],color,glow);}}
 panel(x:number,y:number,z:number,w:number,h:number,yaw:number,color:Vec3=[1,1,1],crop:readonly [number,number,number,number]=[0,0,1,1],glow=0){const right:Vec3=[Math.cos(yaw)*w/2,0,-Math.sin(yaw)*w/2];this.quad([x-right[0],y-h/2,z-right[2]],[x+right[0],y-h/2,z+right[2]],[x+right[0],y+h/2,z+right[2]],[x-right[0],y+h/2,z-right[2]],color,glow,crop);}
 disk(x:number,y:number,z:number,r:number,crop:readonly [number,number,number,number],color:Vec3=[1,1,1]){const [l,t,right,bottom]=crop;for(let i=0;i<96;i++){const a=i/96*Math.PI*2,b=(i+1)/96*Math.PI*2;const uv=(angle:number)=>[l+(right-l)*(.5+.5*Math.cos(angle)),1-(t+(bottom-t)*(.5-.5*Math.sin(angle)))];this.triangle([x,y,z],[x+r*Math.cos(a),y+r*Math.sin(a),z],[x+r*Math.cos(b),y+r*Math.sin(b),z],color,0,[(l+right)/2,1-(t+bottom)/2,...uv(a),...uv(b)]);}}
 wallArc(start:number,end:number,r:number,bottom:number,top:number,crop:readonly [number,number,number,number]){const [left,t,right,b]=crop;for(let i=0;i<24;i++){const a=(start+(end-start)*i/24)*Math.PI/180,next=(start+(end-start)*(i+1)/24)*Math.PI/180;this.quad([Math.sin(a)*r,bottom,-Math.cos(a)*r],[Math.sin(next)*r,bottom,-Math.cos(next)*r],[Math.sin(next)*r,top,-Math.cos(next)*r],[Math.sin(a)*r,top,-Math.cos(a)*r],[1,1,1],0,[left+(right-left)*i/24,t,left+(right-left)*(i+1)/24,b]);}}
 verticalRing(x:number,y:number,z:number,inner:number,outer:number,color:Vec3,glow=0){for(let i=0;i<128;i++){const a=i/128*Math.PI*2,b=(i+1)/128*Math.PI*2;this.quad([x+inner*Math.cos(a),y+inner*Math.sin(a),z],[x+outer*Math.cos(a),y+outer*Math.sin(a),z],[x+outer*Math.cos(b),y+outer*Math.sin(b),z],[x+inner*Math.cos(b),y+inner*Math.sin(b),z],color,glow);}}
 silhouette(x:number,y:number,z:number,w:number,h:number,yaw:number,outline:Outline,crop:readonly [number,number,number,number]){
  const [l,t,r,b]=crop,point=(uv:readonly [number,number]):Vec3=>[x+(uv[0]-.5)*w*Math.cos(yaw),y+(.5-uv[1])*h,z-(uv[0]-.5)*w*Math.sin(yaw)];
  for(const tri of triangulateOutline(outline)){const uv=tri.map(i=>outline[i]);this.triangle(point(uv[0]),point(uv[1]),point(uv[2]),[1,1,1],0,uv.flatMap(p=>[l+(r-l)*p[0],1-(t+(b-t)*p[1])]));}
 }
 mesh():MeshData{return {vertices:new Float32Array(this.values)};}
}
const gold:Vec3=[.81,.59,.29],silver:Vec3=[.71,.77,.83],dark:Vec3=[.026,.03,.043];
export function architecture():MeshData{
 const g=new Geometry();g.box(0,-.2,0,62,.4,62,dark);
 // The reference's paired monumental facades are preserved at the front; the colonnades continue around the world.
 for(const r of [2.8,5,8,11.8,15,20.5,24.8]){g.ring(0,.035,0,r,r+.045,gold,.28);g.ring(0,.04,0,r+.15,r+.175,silver,.22);g.ring(0,.045,0,r+.3,r+.32,gold,.17);}
 for(let i=0;i<56;i++){const a=i/56*Math.PI*2;for(let r=3.4;r<25;r+=1.2){const x=Math.cos(a)*r,z=Math.sin(a)*r,size=r<6?.085:.12;g.box(x,.045,z,size,.008,size,i%3?gold:silver,.13);}}
 g.cylinder(0,16.8,0,29.8,.22,[.07,.085,.12],0,96);g.ring(0,16.78,0,28.2,29.9,gold,.14);g.ring(0,16.75,0,27.8,28.05,silver,.25);
 for(let j=0;j<8;j++){const yaw=j/8*Math.PI;for(let i=0;i<48;i++){const a=i/48*Math.PI,b=(i+1)/48*Math.PI;const p=(r:number,t:number):Vec3=>[Math.cos(t)*r*Math.cos(yaw),14.4+Math.sin(t)*2.6,Math.cos(t)*r*Math.sin(yaw)];g.quad(p(28.4,a),p(28.4,b),p(28.53,b),p(28.53,a),j%2?gold:silver,.35);}}
 // Side galleries and balcony rails leave the medallion and the canonical statues unobstructed.
 for(let i=0;i<22;i++){
  const a=i/22*Math.PI*2;if(Math.cos(a)>.61)continue;const x=Math.sin(a)*28.3,z=-Math.cos(a)*28.3,c=x<0?gold:silver;
  g.cylinder(x,0,z,.84,.26,dark);g.cylinder(x,.26,z,.76,.13,c,.18);g.cylinder(x,.39,z,.54,15.3,c,0,24);g.cylinder(x,.5,z,.65,.1,c,.22);g.cylinder(x,7.15,z,.76,.24,c,.18);g.cylinder(x,15.69,z,.87,.35,c);
  for(let y=.8;y<15.6;y+=.8)g.cylinder(x,y,z,.545,.012,c,.06,24);
  for(let j=0;j<12;j++){const t=j/12*Math.PI*2;g.cylinder(x+Math.sin(t)*.53,.8,z+Math.cos(t)*.53,.032,14.7,c,.1,6);}
  g.box(x,7.4,z,1.8,.16,1.8,c);g.cylinder(x,3.8,z,.63,.045,c,.65);
 }
 for(let i=0;i<144;i++){
  const a=i/144*Math.PI*2,b=(i+1)/144*Math.PI*2;if(Math.cos(a)>.61)continue;
  const p=(angle:number,r:number,y:number):Vec3=>[Math.sin(angle)*r,y,-Math.cos(angle)*r];
  for(const y of [7.45,8.55,15.6,16.1])g.quad(p(a,27.1,y),p(b,27.1,y),p(b,27.25,y+.075),p(a,27.25,y+.075),y>10?gold:silver,.2);
  g.quad(p(a,27.1,7.4),p(b,27.1,7.4),p(b,29,7.4),p(a,29,7.4),dark);
  g.cylinder(Math.sin(a)*27.15,7.45,-Math.cos(a)*27.15,.027,1.2,silver,.09,6);
 }
 g.box(0,.5,-18.4,47,1,.7,[.045,.045,.05]);
 const [cx,cy,cz]=centralMedallion.position,r=centralMedallion.radius;
 g.verticalRing(cx,cy,cz-.02,r+.03,r+.16,gold,.48);g.verticalRing(cx,cy,cz-.015,r+.19,r+.26,silver,.3);g.verticalRing(cx,cy,cz-.01,r-.08,r-.035,gold,.3);
 for(let i=0;i<88;i++){const a=i/88*Math.PI*2;g.box(cx+Math.cos(a)*(r+.095),cy+Math.sin(a)*(r+.095),cz,.055,.055,.09,i%3?gold:silver,.35);}
 // Tiered chandeliers sit high in the vaulted space, clear of the exhibit sight lines.
 for(const [x,z] of [[-8,-7],[8,-7],[0,7]])for(const [y,radius] of [[12.3,2.6],[12.9,2],[13.5,1.25]]){g.ring(x,y,z,radius,radius+.055,x<0?gold:silver,.68);for(let i=0;i<28;i++){const a=i/28*Math.PI*2;g.cylinder(x+Math.sin(a)*radius,y-.18,z+Math.cos(a)*radius,.025,.35,[.92,.88,.74],.8,6);}}
 // Presentation plinths. These dimensions never enter product or material calculations.
 for(const e of spatialExhibits){const [x,,z]=e.position,c=x<0?gold:silver;g.cylinder(x,0,z,.96,.08,dark);g.cylinder(x,.08,z,.945,.026,c,.4);g.cylinder(x,.106,z,.91,.29,dark);g.cylinder(x,.396,z,.92,.02,c,.3);g.cylinder(x,.416,z,.89,.055,dark);g.ring(x,.475,z,.84,.885,c,.45);g.cylinder(x,.471,z,.84,.009,[.058,.06,.066]);}
 // White floral displays echo the approved interior; they are room decoration, not product models.
 for(const [x,z] of museumFloralDisplays){
  g.cylinder(x,0,z,.42,.72,x<0?gold:silver,.08,24);g.ring(x,.73,z,.3,.43,gold,.22);
  for(let j=0;j<13;j++){const a=j*2.39996,radius=.12+Math.sqrt(j/13)*.72,px=x+Math.cos(a)*radius,pz=z+Math.sin(a)*radius,py=1.15+(j%4)*.16;
   g.quad([x,.7,z],[x+.035,.7,z],[px+.02,py,pz],[px,py,pz],[.11,.18,.09]);
   g.triangle([px,py-.35,pz],[px+.35*Math.cos(a),py-.1,pz+.35*Math.sin(a)],[px-.08,py-.04,pz+.06],[.12,.22,.1]);
   for(let k=0;k<5;k++){const t=k/5*Math.PI*2;g.triangle([px,py,pz],[px+Math.cos(t)*.14,py+.075,pz+Math.sin(t)*.14],[px+Math.cos(t+.8)*.14,py+.075,pz+Math.sin(t+.8)*.14],[.9,.88,.79],.08);}
  }
 }
 return g.mesh();
}
// Retained approved exhibition architecture; display units only.
export const museumArchitectureGeometry = architecture;
const vertex=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec4 aColor;attribute vec2 aUV;
uniform mediump vec3 uCamera;uniform vec3 uForward,uRight,uUp;uniform float uTan,uAspect,uLensShift,uLensLift;
varying mediump vec3 vNormal,vColor,vWorld;varying mediump float vGlow,vDepth;varying highp vec2 vUV;
void main(){vec3 p=aPosition-uCamera;float depth=dot(p,uForward);gl_Position=vec4(dot(p,uRight)/(uTan*uAspect)+uLensShift*depth,dot(p,uUp)/uTan+uLensLift*depth,1.00668896*depth-.40133779,depth);vNormal=aNormal;vColor=aColor.rgb;vGlow=aColor.a;vUV=aUV;vWorld=aPosition;vDepth=depth;}`;
export const museumFragmentShader=`precision mediump float;
varying mediump vec3 vNormal,vColor,vWorld;varying mediump float vGlow,vDepth;varying highp vec2 vUV;
uniform sampler2D uTexture,uInteriorTexture;uniform mediump vec3 uCamera;uniform float uTextured,uInteriorReady,uRoom,uExposure;
void main(){vec3 n=normalize(vNormal),view=normalize(uCamera-vWorld);vec3 warm=normalize(vec3(-7.,9.,-4.)-vWorld),cool=normalize(vec3(7.,9.,-4.)-vWorld);
float diffuse=.43+.27*abs(dot(n,warm))+.22*abs(dot(n,cool));
float spec=pow(max(0.,dot(n,normalize(warm+view))),38.)*.44+pow(max(0.,dot(n,normalize(cool+view))),42.)*.32;
vec3 color=vColor*diffuse+mix(vec3(.75,.86,1.),vec3(1.,.78,.44),step(vWorld.x,0.))*spec;
if(uTextured>.5){color=texture2D(uTexture,vUV).rgb*uExposure;}
else{color=mix(color,vColor*1.18,vGlow);
 if(uRoom>.5&&vWorld.y>.1&&vWorld.y<10.9&&abs(n.y)<.6){vec2 tile=fract(vec2(vWorld.x+vWorld.z,vWorld.y)*17.);float grout=step(.965,max(tile.x,tile.y));color*=1.-grout*.22;color+=vec3(.07,.055,.026)*pow(max(0.,dot(n,view)),12.);}
 if(uRoom>.5&&vWorld.y<.025&&n.y>.8){float vein=sin(vWorld.x*.54+vWorld.z*.31+sin(vWorld.z*.33)*2.6+sin(vWorld.x*.23));float ribbon=pow(max(0.,1.-abs(vein)),14.);color=vec3(.025,.029,.044)+vec3(.055,.045,.027)*ribbon;
  if(uInteriorReady>.5){vec3 reflected=reflect(-view,n);float theta=atan(reflected.x,-reflected.z);float ux=theta<0.?mix(.15,.396,clamp(1.+theta*.32,0.,1.)):mix(.605,.86,clamp(theta*.32,0.,1.));vec2 uv=vec2(ux,1.-clamp(.3-reflected.y*.18,.068,.4));vec3 environment=texture2D(uInteriorTexture,uv).rgb;float fresnel=.035+.19*pow(1.-abs(dot(n,view)),3.);color=mix(color,environment,fresnel);}
  color+=vec3(.015,.011,.006)*pow(max(0.,1.-abs(sin(length(vWorld.xz)*1.4))),20.);
 }}
float fog=smoothstep(24.,55.,vDepth);color=mix(color,vec3(.025,.025,.035),fog*.42);gl_FragColor=vec4(clamp(color,0.,1.),1.);}`;
export type MuseumRenderer={render:(camera:SpatialCamera,node:string,selected?:SpatialExhibit['id'])=>void;interiorReady:()=>boolean;pick:(camera:SpatialCamera,x:number,y:number)=>SpatialExhibit|null;pickNavigation:(camera:SpatialCamera,x:number,y:number,node:import('./museum-spatial').SpatialNodeId)=>import('./museum-spatial').SpatialNodeId|null;dispose:()=>void;};
export function createMuseumRenderer(canvas:HTMLCanvasElement,onAssetError:(message:string)=>void,displayMesh?:MeshData,onInvalidate:()=>void=()=>{}):MuseumRenderer{
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power'});if(!gl)throw Error('WEBGL_UNAVAILABLE');
 const shader=(type:number,source:string)=>{const s=gl.createShader(type);if(!s)throw Error('GL_SHADER');gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw Error('GL_SHADER_COMPILE');}return s;};
 const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,museumFragmentShader),program=gl.createProgram();if(!program)throw Error('GL_PROGRAM');gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('GL_PROGRAM_LINK');
 gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(.018,.018,.025,1);
 const uniforms=Object.fromEntries(['uCamera','uForward','uRight','uUp','uTan','uAspect','uLensShift','uLensLift','uTexture','uTextured','uInteriorTexture','uInteriorReady','uRoom','uExposure'].map(x=>[x,gl.getUniformLocation(program,x)]));
 const attributes=[['aPosition',3,0],['aNormal',3,12],['aColor',4,24],['aUV',2,40]] as const;
 const buffers:WebGLBuffer[]=[],textures=new Map<string,WebGLTexture>(),images:HTMLImageElement[]=[],loaded=new Set<string>(),originals=new Set<string>();let disposed=false;
 function upload(mesh:MeshData){const b=gl!.createBuffer();if(!b)throw Error('GL_BUFFER');buffers.push(b);gl!.bindBuffer(gl!.ARRAY_BUFFER,b);gl!.bufferData(gl!.ARRAY_BUFFER,mesh.vertices,gl!.STATIC_DRAW);return {buffer:b,count:mesh.vertices.length/12};}
 const room=upload(displayMesh ?? architecture());
 const planes=(displayMesh ? [] : spatialExhibits).map(e=>{const g=new Geometry(),[x,y,z]=e.position,{w,h,outline}=displayShape(e);g.silhouette(x,y,z,w,h,displayYaw(e),outline,e.crop??[0,0,1,1]);return {mesh:upload(g.mesh()),image:e.image,id:e.id,position:e.position};});
 const interior=new Geometry();for(const p of frontFacades)interior.panel(p.position[0],p.position[1],p.position[2],p.width,p.height,0,[1,1,1],p.crop);
 for(const panel of interiorPanels.filter(p=>p.name.includes('colonnade')||p.name.includes('Rear')))interior.wallArc(panel.start,panel.end,29,.15,16.6,panel.crop);
 const interiorMesh=displayMesh?null:upload(interior.mesh());
 const emblem=new Geometry();emblem.disk(...centralMedallion.position,centralMedallion.radius,medallionCrop);const emblemMesh=displayMesh?null:upload(emblem.mesh());
 function loadTexture(src:string,fullQuality=false){if(disposed||(textures.has(src)&&(!fullQuality||originals.has(src))))return;if(fullQuality)originals.add(src);const t=textures.get(src)??gl!.createTexture();if(!t)return;const fresh=!textures.has(src);textures.set(src,t);if(fresh){gl!.activeTexture(gl!.TEXTURE0);gl!.bindTexture(gl!.TEXTURE_2D,t);gl!.texImage2D(gl!.TEXTURE_2D,0,gl!.RGBA,1,1,0,gl!.RGBA,gl!.UNSIGNED_BYTE,new Uint8Array([35,35,40,255]));gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_WRAP_S,gl!.CLAMP_TO_EDGE);gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_WRAP_T,gl!.CLAMP_TO_EDGE);gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_MIN_FILTER,gl!.LINEAR);gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_MAG_FILTER,gl!.LINEAR);}
 const img=new Image();images.push(img);img.onload=()=>{if(disposed||(!fullQuality&&originals.has(src)))return;try{gl!.activeTexture(gl!.TEXTURE0);gl!.bindTexture(gl!.TEXTURE_2D,t);gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL,true);gl!.texImage2D(gl!.TEXTURE_2D,0,gl!.RGBA,gl!.RGBA,gl!.UNSIGNED_BYTE,img);loaded.add(src);onInvalidate();}catch{onAssetError('ინტერიერის ან ექსპონატის გამოსახულება ვერ ჩაიტვირთა');}};img.onerror=()=>{if(disposed)return;if(img.src.endsWith('.webp')){img.src=src;return;}onAssetError('ინტერიერის ან ექსპონატის გამოსახულება ვერ ჩაიტვირთა');};img.src=fullQuality?src:museumPresentationAsset(src);}
 if(!displayMesh)loadTexture(interiorReference);
 const fallback=gl.createTexture();if(!fallback)throw Error('GL_TEXTURE');textures.set('__fallback__',fallback);gl.bindTexture(gl.TEXTURE_2D,fallback);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 function draw(mesh:{buffer:WebGLBuffer;count:number},image?:string,exposure=1){gl!.bindBuffer(gl!.ARRAY_BUFFER,mesh.buffer);for(const [name,size,offset] of attributes){const loc=gl!.getAttribLocation(program!,name);if(loc<0)continue;gl!.enableVertexAttribArray(loc);gl!.vertexAttribPointer(loc,size,gl!.FLOAT,false,48,offset);}gl!.uniform1f(uniforms.uTextured,image&&loaded.has(image)?1:0);gl!.uniform1f(uniforms.uExposure,exposure);gl!.activeTexture(gl!.TEXTURE1);gl!.bindTexture(gl!.TEXTURE_2D,textures.get(interiorReference)??fallback);gl!.uniform1i(uniforms.uInteriorTexture,1);gl!.activeTexture(gl!.TEXTURE0);gl!.bindTexture(gl!.TEXTURE_2D,(image?textures.get(image):null)??fallback);gl!.uniform1i(uniforms.uTexture,0);gl!.drawArrays(gl!.TRIANGLES,0,mesh.count);}
 let arrowKey='',arrows:ReturnType<typeof upload>|null=null;
 return {interiorReady:()=>!!displayMesh||loaded.has(interiorReference),pick(camera,x,y){if(disposed||displayMesh)return null;const e=pickMuseumExhibit(camera,x,y,canvas.clientWidth,canvas.clientHeight);return e&&loaded.has(e.image)?e:null;},pickNavigation(camera,x,y,node){return disposed||displayMesh||!loaded.has(interiorReference)?null:pickMuseumNode(camera,x,y,canvas.clientWidth,canvas.clientHeight,node);},render(camera,node,selected){if(disposed||gl!.isContextLost())return;const ratio=Math.min(window.devicePixelRatio||1,1.7),width=Math.max(1,Math.round(canvas.clientWidth*ratio)),height=Math.max(1,Math.round(canvas.clientHeight*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}gl!.viewport(0,0,width,height);gl!.clear(gl!.COLOR_BUFFER_BIT|gl!.DEPTH_BUFFER_BIT);const basis=cameraBasis(camera);for(const key of ['forward','right','up'] as const)gl!.uniform3fv(uniforms['u'+key[0].toUpperCase()+key.slice(1)],basis[key]);gl!.uniform3fv(uniforms.uCamera,camera.position);gl!.uniform1f(uniforms.uTan,Math.tan(museumPresentationFov(camera.fov,camera.focus??(camera.framing==='OBJECT'),canvas.clientWidth,canvas.clientHeight,camera.displayBounds)*Math.PI/360));gl!.uniform1f(uniforms.uAspect,width/height);gl!.uniform1f(uniforms.uLensShift,museumLensShift(camera.focus??(camera.framing==='OBJECT'),canvas.clientWidth));gl!.uniform1f(uniforms.uLensLift,museumLensLift(camera.focus??(camera.framing==='OBJECT'),canvas.clientWidth));gl!.uniform1f(uniforms.uRoom,displayMesh?0:1);gl!.uniform1f(uniforms.uInteriorReady,loaded.has(interiorReference)?1:0);if(interiorMesh)draw(interiorMesh,interiorReference,.93);draw(room);if(displayMesh)return;if(emblemMesh)draw(emblemMesh,interiorReference,1.03);
 for(const p of planes){const distance=Math.hypot(p.position[0]-camera.position[0],p.position[2]-camera.position[2]);if(distance<27)loadTexture(p.image,p.id===selected);if(distance<27&&loaded.has(p.image))draw(p.mesh,p.image);}
 if(arrowKey!==node){if(arrows){gl!.deleteBuffer(arrows.buffer);buffers.splice(buffers.indexOf(arrows.buffer),1);}const g=new Geometry(),origin=spatialNodes.find(n=>n.id===node)!;for(const targetId of origin.connected_nodes){const target=spatialNodes.find(n=>n.id===targetId)!,dx=target.scene_position[0]-origin.scene_position[0],dz=target.scene_position[2]-origin.scene_position[2],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len,x=origin.scene_position[0]+ux*3.8,z=origin.scene_position[2]+uz*3.8;const targetPosition=navigationTarget(origin.id,targetId),p=(side:number,forward:number):Vec3=>[targetPosition[0]+uz*side+ux*forward,.09,targetPosition[2]-ux*side+uz*forward];g.triangle(p(-.23,-.16),p(.23,-.16),p(0,.46),[.96,.87,.69],.82);g.quad(p(-.07,-.65),p(.07,-.65),p(.07,-.16),p(-.07,-.16),[.96,.87,.69],.82);g.ring(x,.08,z,.74,.77,silver,.35);}arrows=upload(g.mesh());arrowKey=node;}if(arrows)draw(arrows);
 },dispose(){disposed=true;for(const img of images){img.onload=null;img.onerror=null;}for(const b of buffers)gl!.deleteBuffer(b);for(const t of textures.values())gl!.deleteTexture(t);gl!.deleteProgram(program);gl!.deleteShader(vs);gl!.deleteShader(fs);}};
}
