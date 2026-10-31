import {cameraBasis,spatialExhibits,nodeById,type SpatialNodeId,type SpatialCamera,type SpatialExhibit,type Vec3} from './museum-spatial.ts';
import {museumLensShift,museumLensLift,museumPresentationFov,exhibitionShape,exhibitionFacing} from './museum-interior.ts';
// Presentation silhouettes traced against the supplied reference. They are flat image displays, never 3D product geometry.
export type Outline=readonly (readonly [number,number])[];
const rectangle:Outline=[[0,0],[1,0],[1,1],[0,1]];
const silhouettes:Partial<Record<SpatialExhibit['id'],Outline>>={
 art:[[0.02,0.96],[0.01,0.89],[0.04,0.73],[0.035,0.59],[0.004,0.604],[0.0,0.532],[0.224,0.463],[0.322,0.326],[0.5,0.236],[0.681,0.173],[0.75,0.099],[0.812,0.12],[0.884,0.113],[0.883,0.179],[0.847,0.218],[0.872,0.268],[0.88,0.35],[0.919,0.395],[0.881,0.439],[0.849,0.425],[0.823,0.373],[0.722,0.339],[0.677,0.312],[0.655,0.405],[0.698,0.493],[0.659,0.561],[0.627,0.746],[0.668,0.846],[0.726,0.871],[0.772,0.945],[0.614,0.996],[0.065,0.996]],
 music:[[0.53,0.184],[0.756,0.179],[0.707,0.281],[0.643,0.337],[0.873,0.382],[0.947,0.407],[0.958,0.444],[0.934,0.521],[0.895,0.565],[0.893,0.746],[0.9,0.778],[0.877,0.806],[0.861,0.98],[0.837,0.983],[0.82,0.812],[0.719,0.831],[0.699,1],[0.67,1],[0.663,0.825],[0.455,0.837],[0.438,0.962],[0.41,1],[0.366,1],[0.38,0.82],[0.3,0.808],[0.277,0.979],[0.246,1],[0.21,1],[0.212,0.794],[0.09,0.793],[0.072,0.973],[0.045,0.973],[0.053,0.786],[0.033,0.777],[0.033,0.715],[0.105,0.668],[0.138,0.675],[0.14,0.62],[0.169,0.615],[0.275,0.438]],
 furniture:[[0,.37],[.06,.06],[.23,.04],[.31,.16],[.66,.15],[.75,.06],[.89,.07],[1,.34],[.98,.86],[.92,1],[.88,1],[.85,.84],[.17,.84],[.11,1],[.06,1],[.03,.83]],
 fashion:[[0.48,0.017],[0.514,0.018],[0.543,0.037],[0.547,0.077],[0.535,0.123],[0.525,0.142],[0.576,0.155],[0.59,0.2],[0.61,0.37],[0.632,0.45],[0.634,0.48],[0.625,0.499],[0.612,0.506],[0.615,0.577],[0.665,0.716],[0.738,0.87],[0.798,0.909],[0.9,0.934],[0.909,0.958],[0.876,0.975],[0.81,0.967],[0.7,0.976],[0.57,0.977],[0.47,0.972],[0.355,0.973],[0.2,0.965],[0.065,0.96],[0.06,0.932],[0.13,0.91],[0.185,0.875],[0.239,0.745],[0.29,0.598],[0.36,0.485],[0.348,0.496],[0.337,0.478],[0.34,0.444],[0.365,0.373],[0.388,0.251],[0.408,0.176],[0.451,0.15],[0.452,0.128],[0.446,0.1],[0.444,0.058],[0.449,0.03]],
 automotive:[[0.014,0.903],[0.01,0.533],[0.029,0.354],[0.075,0.196],[0.171,0.08],[0.228,0.01],[0.448,0.065],[0.575,0.286],[0.744,0.348],[0.907,0.508],[0.915,0.779],[0.904,0.876],[0.858,0.924],[0.797,0.921],[0.748,0.855],[0.593,0.907],[0.479,0.995],[0.392,0.985],[0.31,0.887],[0.092,0.822],[0.073,0.901]],
 motorcycles:[[0,.7],[.07,.47],[.21,.48],[.29,.39],[.38,.23],[.52,.17],[.65,.34],[.68,.08],[.8,.01],[.83,.12],[.76,.2],[.78,.42],[.92,.51],[1,.7],[.99,.94],[.84,1],[.7,.9],[.6,.75],[.32,.78],[.27,.94],[.1,1],[0,.89]],
 architecture:[[0,1],[.02,.55],[.16,.5],[.17,.31],[.29,.28],[.32,.01],[.41,.15],[.45,.41],[.57,.47],[.6,.08],[.68,0],[.73,.38],[.84,.42],[.91,.58],[1,.62],[1,1]],
 jewelry:[[.03,1],[.03,.68],[.19,.36],[.3,.13],[.5,0],[.7,.13],[.81,.38],[.97,.69],[.98,1]],
 watches:[[.1,1],[.1,.57],[.16,.23],[.37,0],[.71,.03],[.91,.33],[1,.62],[.86,1]],
 eyewear:[[.03,.08],[.15,0],[.6,.01],[.9,.07],[.99,.17],[1,.72],[.89,.94],[.6,.93],[.46,.75],[.36,.92],[.06,1],[0,.77]],
 bags:[[0.09,0.55],[0.127,0.495],[0.254,0.494],[0.258,0.44],[0.306,0.399],[0.371,0.38],[0.39,0.329],[0.444,0.287],[0.499,0.279],[0.55,0.303],[0.585,0.361],[0.61,0.488],[0.802,0.504],[0.836,0.531],[0.843,0.565],[0.855,0.968],[0.814,0.998],[0.163,0.984],[0.119,0.956],[0.112,0.665]],
 shoes:[[0.18,0.98],[0.15,0.91],[0.2,0.53],[0.208,0.361],[0.238,0.315],[0.254,0.322],[0.255,0.446],[0.313,0.439],[0.351,0.962],[0.383,0.971],[0.383,0.65],[0.418,0.637],[0.418,0.46],[0.455,0.398],[0.482,0.411],[0.495,0.934],[0.54,0.943],[0.56,0.512],[0.563,0.36],[0.607,0.314],[0.636,0.335],[0.64,0.503],[0.67,0.54],[0.677,0.94],[0.71,0.94],[0.728,0.665],[0.766,0.627],[0.764,0.48],[0.788,0.339],[0.814,0.332],[0.841,0.4],[0.85,0.542],[0.848,0.948],[0.814,1],[0.25,1]],
 stationery:[[.02,.98],[0,.62],[.04,.06],[.98,0],[1,.62],[.74,.7],[.97,.92],[.95,1]],
 collectibles:[[.08,1],[.13,.79],[.33,.58],[.27,.33],[.39,.04],[.72,0],[.87,.25],[.78,.51],[.64,.76],[.96,1]],
 decor:[[0,1],[.04,.75],[.18,.67],[.3,.21],[.65,0],[.86,.4],[.9,.69],[1,.92],[.91,1]],
 mosaic:[[.12,.98],[0,.76],[0,.3],[.23,.04],[.58,0],[.88,.19],[1,.6],[.88,.89],[.71,1]],
 technology:rectangle,
 case:[[.06,.94],[0,.66],[.01,.37],[.11,.12],[.4,0],[.71,.02],[.94,.21],[1,.65],[.9,.9],[.6,1],[.24,1]],
};
export function displayShape(e:SpatialExhibit){
 return {...exhibitionShape(e.id,e.crop??[0,0,1,1]),outline:silhouettes[e.id]??rectangle};
}
export function displayYaw(e:SpatialExhibit){return exhibitionFacing(e.position[0],e.position[2],e.id);}
export function insideOutline(x:number,y:number,outline:Outline):boolean{let inside=false;for(let i=0,j=outline.length-1;i<outline.length;j=i++){const a=outline[i],b=outline[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
// Ear clipping preserves concave image outlines. The returned triangles are display geometry only.
export function triangulateOutline(points:Outline):number[][]{
 const area=points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0),sign=area<0?-1:1;
 const cross=(a:readonly number[],b:readonly number[],c:readonly number[])=>((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))*sign;
 const indices=points.map((_,i)=>i),result:number[][]=[];
 while(indices.length>3){let clipped=false;for(let i=0;i<indices.length;i++){
  const a=indices[(i+indices.length-1)%indices.length],b=indices[i],c=indices[(i+1)%indices.length];if(cross(points[a],points[b],points[c])<=1e-10)continue;
  const occupied=indices.some(j=>j!==a&&j!==b&&j!==c&&cross(points[a],points[b],points[j])>=-1e-10&&cross(points[b],points[c],points[j])>=-1e-10&&cross(points[c],points[a],points[j])>=-1e-10);if(occupied)continue;
  result.push([a,b,c]);indices.splice(i,1);clipped=true;break;
 }if(!clipped)throw Error('INVALID_DISPLAY_OUTLINE');}
 if(indices.length===3)result.push([...indices]);return result;
}
function sceneRay(camera:SpatialCamera,x:number,y:number,width:number,height:number):Vec3|null{
 if(![x,y,width,height].every(Number.isFinite)||width<=0||height<=0||x<0||x>1||y<0||y>1)return null;
 const focus=camera.focus??(camera.framing==='OBJECT'),b=cameraBasis(camera),tan=Math.tan(museumPresentationFov(camera.fov,focus,width,height,camera.displayBounds)*Math.PI/360),rx=((x-.5)*2-museumLensShift(focus,width))*tan*width/height,ry=((.5-y)*2-museumLensLift(focus,width))*tan;
 return b.forward.map((v,i)=>v+b.right[i]*rx+b.up[i]*ry) as unknown as Vec3;
}
export function navigationTarget(from:SpatialNodeId,to:SpatialNodeId):Vec3{
 const a=nodeById(from),b=nodeById(to);if(!a.connected_nodes.includes(to))throw Error('UNCONNECTED_NAVIGATION_TARGET');
 const dx=b.scene_position[0]-a.scene_position[0],dz=b.scene_position[2]-a.scene_position[2],d=Math.hypot(dx,dz);return [a.scene_position[0]+dx/d*3.8,.09,a.scene_position[2]+dz/d*3.8];
}
export function pickMuseumNode(camera:SpatialCamera,x:number,y:number,width:number,height:number,node:SpatialNodeId):SpatialNodeId|null{
 const ray=sceneRay(camera,x,y,width,height);if(!ray||Math.abs(ray[1])<1e-7)return null;const depth=(.09-camera.position[1])/ray[1];if(depth<.2||depth>35)return null;
 const px=camera.position[0]+ray[0]*depth,pz=camera.position[2]+ray[2]*depth;
 return nodeById(node).connected_nodes.find(id=>{const target=navigationTarget(node,id);return Math.hypot(px-target[0],pz-target[2])<.81;})??null;
}
export function pickMuseumExhibit(camera:SpatialCamera,x:number,y:number,width:number,height:number):SpatialExhibit|null{
 const ray=sceneRay(camera,x,y,width,height);if(!ray)return null;
 let nearest:SpatialExhibit|null=null,depth=Infinity;
 for(const e of spatialExhibits){const yaw=displayYaw(e),n=[Math.sin(yaw),0,Math.cos(yaw)],right=[Math.cos(yaw),0,-Math.sin(yaw)],relative=e.position.map((v,i)=>v-camera.position[i]),dot=(v:readonly number[],w:readonly number[])=>v.reduce((s,a,i)=>s+a*w[i],0),denominator=dot(n,ray);if(Math.abs(denominator)<1e-7)continue;const d=dot(n,relative)/denominator;if(d<.2||d>=depth||d>35)continue;
  const hit=camera.position.map((v,i)=>v+ray[i]*d-e.position[i]),shape=displayShape(e),u=.5+dot(hit,right)/shape.w,v=.5-hit[1]/shape.h;
  if(insideOutline(u,v,shape.outline)){nearest=e;depth=d;}
 }
 return nearest;
}
