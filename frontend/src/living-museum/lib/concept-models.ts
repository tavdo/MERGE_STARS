import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const conceptModelAssets: Record<string, string> = {
  bags: '/living-museum/models/concept-bag.glb',
  watches: '/living-museum/models/concept-watch.glb',
  fashion: '/living-museum/models/concept-gown.glb',
};

// Interpreted exhibition studies, not reconstructions or authoritative CORE products.
export function createConceptModel(kind: 'bags' | 'watches' | 'fashion') {
  const group = new THREE.Group();
  group.name = `MERGE ${kind} - interpreted CONCEPT`;
  group.userData = { status: 'CONCEPT', interpretation: 'Unseen surfaces and construction are interpreted', sourceOfTruth: false, physicalDimensions: false };
  const gold = new THREE.MeshStandardMaterial({ color: 0xc6a257, metalness: .88, roughness: .27 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xd8dce0, metalness: .92, roughness: .24 });
  const leather = new THREE.MeshStandardMaterial({ color: 0x181615, metalness: .08, roughness: .52 });
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, x=0, y=0, z=0) => {
    const object = new THREE.Mesh(geometry, material); object.position.set(x,y,z); object.castShadow=true; object.receiveShadow=true; group.add(object); return object;
  };
  if (kind === 'bags') {
    mesh(new RoundedBoxGeometry(1.7,1.15,.64,4,.13),leather,0,.65);
    mesh(new RoundedBoxGeometry(1.72,.42,.68,4,.1),gold,0,1.02,.015);
    const handle = new THREE.CatmullRomCurve3([new THREE.Vector3(-.54,1.23,0),new THREE.Vector3(-.48,1.82,0),new THREE.Vector3(0,2.02,0),new THREE.Vector3(.48,1.82,0),new THREE.Vector3(.54,1.23,0)]);
    mesh(new THREE.TubeGeometry(handle,64,.047,10,false),gold);
    for (const x of [-.54,.54]) mesh(new THREE.TorusGeometry(.09,.025,8,24),gold,x,1.23,.05);
    mesh(new RoundedBoxGeometry(.2,.22,.08,2,.025),silver,0,.85,.38);
    for (const side of [-1,1]) for (let row=0;row<7;row++) for(let col=0;col<13;col++) {
      const tile=mesh(new THREE.BoxGeometry(.095,.095,.018),(row+col)%5===0?silver:gold,-.66+col*.11,.25+row*.105,side*.33);
      tile.rotation.z=Math.PI/4;
    }
  } else if (kind === 'watches') {
    const dial = new THREE.MeshStandardMaterial({color:0x101718,metalness:.3,roughness:.36});
    const caseMesh=mesh(new THREE.CylinderGeometry(.64,.64,.23,80),gold,0,0,0);caseMesh.rotation.x=Math.PI/2;
    mesh(new THREE.TorusGeometry(.56,.055,12,80),silver,0,0,.14);
    const face=mesh(new THREE.CylinderGeometry(.55,.55,.024,80),dial,0,0,.13);face.rotation.x=Math.PI/2;
    for(let i=0;i<12;i++){const a=i*Math.PI/6,tick=mesh(new THREE.BoxGeometry(.025,i%3===0?.105:.07,.018),silver,Math.sin(a)*.46,Math.cos(a)*.46,.155);tick.rotation.z=-a;}
    const hour=mesh(new THREE.BoxGeometry(.035,.28,.025),gold,-.08,.105,.18);hour.rotation.z=.65;
    const minute=mesh(new THREE.BoxGeometry(.024,.4,.02),silver,.13,.12,.2);minute.rotation.z=-.8;
    mesh(new THREE.SphereGeometry(.04,16,12),gold,0,0,.22);
    const crown=mesh(new THREE.CylinderGeometry(.075,.075,.11,20),gold,.69,0,0);crown.rotation.z=Math.PI/2;
    for(const side of [-1,1]) for(let i=0;i<8;i++) {
      const y=side*(.62+i*.14),z=-.035-Math.pow(i/8,2)*.22;
      mesh(new RoundedBoxGeometry(.68,.125,.14,2,.028),silver,0,y,z);
      mesh(new RoundedBoxGeometry(.26,.12,.15,2,.025),gold,0,y,z+.012);
    }
    group.rotation.x=-.12;
  } else {
    const fabric=new THREE.MeshStandardMaterial({color:0xb99a60,metalness:.5,roughness:.44,side:THREE.DoubleSide});
    const geometry=new THREE.CylinderGeometry(.2,.95,1.9,96,36,true),positions=geometry.getAttribute('position');
    for(let i=0;i<positions.count;i++) {
      const x=positions.getX(i),z=positions.getZ(i),y=positions.getY(i),a=Math.atan2(z,x),fold=1+.065*Math.sin(a*18)*(1-(y+.95)/1.9);
      positions.setXYZ(i,x*fold,y,z*fold*.78);
    }
    geometry.computeVertexNormals();mesh(geometry,fabric,0,1);
    const profile=[new THREE.Vector2(.2,0),new THREE.Vector2(.19,.12),new THREE.Vector2(.25,.35),new THREE.Vector2(.33,.52),new THREE.Vector2(.3,.64)];
    const bodice=mesh(new THREE.LatheGeometry(profile,64),gold,0,1.95);bodice.scale.z=.68;
    mesh(new THREE.TorusGeometry(.205,.027,8,64),silver,0,1.96).rotation.x=Math.PI/2;
    for(const side of [-1,1]) {
      const strap=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.2,2.48,.12),new THREE.Vector3(side*.22,2.75,0),new THREE.Vector3(side*.2,2.48,-.12)]);
      mesh(new THREE.TubeGeometry(strap,24,.026,8,false),gold);
    }
    const jewels=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.018),silver,540),matrix=new THREE.Matrix4();
    for(let i=0;i<540;i++){const h=(i%30)/30,a=Math.floor(i/30)*Math.PI/9,r=(.95-.75*h)*(1+.065*Math.sin(a*18)*(1-h));matrix.makeTranslation(Math.cos(a)*r,.05+h*1.9,Math.sin(a)*r*.78);jewels.setMatrixAt(i,matrix);}group.add(jewels);
  }
  group.updateMatrixWorld(true); return group;
}
