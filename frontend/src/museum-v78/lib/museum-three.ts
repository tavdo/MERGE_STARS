import * as THREE from 'three';
import type { MeshData, MuseumRenderer } from './museum-webgl.ts';
import { createMuseumThreeRenderer } from './museum-three-scene.ts';
export { createMuseumThreeRenderer, applyMuseumCamera as updateMuseumCamera } from './museum-three-scene.ts';
export type { MuseumThreeRenderer } from './museum-three-scene.ts';
export type { MuseumRenderer } from './museum-webgl.ts';

// Preserved presentation-buffer API from the parallel Version 22 integration.
export function presentationGeometry(data: MeshData) {
  const geometry = new THREE.BufferGeometry(), buffer = new THREE.InterleavedBuffer(data.vertices, 12);
  geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(buffer, 3, 0));
  geometry.setAttribute('normal', new THREE.InterleavedBufferAttribute(buffer, 3, 3));
  geometry.setAttribute('aColor', new THREE.InterleavedBufferAttribute(buffer, 4, 6));
  geometry.setAttribute('uv', new THREE.InterleavedBufferAttribute(buffer, 2, 10));
  geometry.computeBoundingSphere(); return geometry;
}
// One active Three.js world renderer; includes the existing room and real CORE vitrines.
export function createMuseumRenderer(canvas:HTMLCanvasElement,onAssetError:(message:string)=>void,_unused?:MeshData,onInvalidate:()=>void=()=>{}):MuseumRenderer {
  return createMuseumThreeRenderer(canvas,onAssetError,onInvalidate);
}
