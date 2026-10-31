import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export function disposeModelObjects(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  root.traverse(object => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    if (mesh.material) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
  });
  for (const material of materials) for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
  for (const texture of textures) { texture.dispose(); const source = texture.source?.data as { close?: () => void } | undefined; if (typeof source?.close === "function") source.close(); }
  for (const material of materials) material.dispose(); for (const geometry of geometries) geometry.dispose();
}
export async function createCoreModelStage(canvas: HTMLCanvasElement, bytes: ArrayBuffer, signal: AbortSignal) {
  const manager = new THREE.LoadingManager();
  manager.setURLModifier(url => { if (!/^(blob:|data:image\/(png|jpeg|webp);base64,)/.test(url)) throw Error("MODEL_EXTERNAL_RESOURCE_REJECTED"); return url; });
  const asset = await new GLTFLoader(manager).parseAsync(bytes, "");
  if (signal.aborted) { disposeModelObjects(asset.scene); throw Error("MODEL_CANCELLED"); }
  let renderer: THREE.WebGLRenderer | null = null, environment: THREE.WebGLRenderTarget | null = null;
  const scene = new THREE.Scene();
  try {
    const bounds = new THREE.Box3().setFromObject(asset.scene), size = bounds.getSize(new THREE.Vector3()), center = bounds.getCenter(new THREE.Vector3()), longest = Math.max(size.x, size.y, size.z);
    if (![...size, ...center].every(Number.isFinite) || longest <= 0) throw Error("MODEL_GEOMETRY_INVALID");
    // Parent display transform only. Never physical geometry, weight or price.
    const display = new THREE.Group(), scale = 2.15 / longest;
    asset.scene.position.sub(center); display.add(asset.scene); display.scale.setScalar(scale); display.position.y = size.y * scale / 2 + .12; scene.add(display);
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.4, .12, 64), new THREE.MeshStandardMaterial({ color: 0x10151c, metalness: .72, roughness: .24 })); plinth.position.y = .05; scene.add(plinth);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.34, .012, 8, 80), new THREE.MeshStandardMaterial({ color: 0xc5b281, metalness: .85, roughness: .3 })); rim.rotation.x = Math.PI / 2; rim.position.y = .113; scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xdbe7ff, 0x27201a, 2));
    for (const [color, x, y, z, intensity] of [[0xffe5ba, -3, 5, 4, 3], [0xc3d8ff, 4, 3, 1, 3], [0xffffff, 0, 4, -3, 2]]) { const light = new THREE.DirectionalLight(color, intensity); light.position.set(x, y, z); scene.add(light); }
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    if (renderer.getContext().isContextLost()) throw Error("MODEL_CONTEXT_UNAVAILABLE");
    renderer.debug.onShaderError = () => { throw Error("MODEL_SHADER_UNAVAILABLE"); };
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7)); renderer.setClearColor(0x080b10, 0); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
    const generator = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment(); environment = generator.fromScene(room, .04); scene.environment = environment.texture; room.dispose(); generator.dispose();
    const camera = new THREE.PerspectiveCamera(42, 1, .05, 80), orbit = { yaw: 0, pitch: .16, distance: 4.6 };
    function render() {
      if (!renderer || signal.aborted || renderer.getContext().isContextLost()) return;
      const width = Math.max(1, canvas.clientWidth), height = Math.max(1, canvas.clientHeight); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
      const distance = orbit.distance * Math.max(1, .85 / camera.aspect);
      camera.position.set(Math.sin(orbit.yaw) * Math.cos(orbit.pitch) * distance, .95 + Math.sin(orbit.pitch) * distance, Math.cos(orbit.yaw) * Math.cos(orbit.pitch) * distance); camera.lookAt(0, .95, 0); renderer.render(scene, camera);
    }
    render();
    return { orbit, render, reset() { Object.assign(orbit, { yaw: 0, pitch: .16, distance: 4.6 }); }, dispose() { disposeModelObjects(scene); environment?.dispose(); renderer?.dispose(); renderer = null; } };
  } catch (error) { disposeModelObjects(scene); if (!asset.scene.parent) disposeModelObjects(asset.scene); environment?.dispose(); renderer?.dispose(); throw error; }
}
