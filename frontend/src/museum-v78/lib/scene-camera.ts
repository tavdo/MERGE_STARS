// Camera coordinates describe an uploaded 2D scene, never product geometry,
// physical dimensions, an avatar fit or a measured weight.
export type SceneCamera = { x: number; y: number; zoom: number };
export function sceneCamera(value: SceneCamera): SceneCamera {
  if (![value.x, value.y, value.zoom].every(Number.isFinite)) throw new Error("Invalid scene camera");
  const zoom = Math.max(1, Math.min(3, value.zoom)), edge = 50 / zoom;
  return { x: Math.max(edge, Math.min(100 - edge, value.x)), y: Math.max(edge, Math.min(100 - edge, value.y)), zoom };
}
export function zoomScene(value: SceneCamera, change: number): SceneCamera {
  if (!Number.isFinite(change)) throw new Error("Invalid zoom");
  return sceneCamera({ ...value, zoom: value.zoom + change });
}
export function panScene(value: SceneCamera, dx: number, dy: number, width: number, height: number): SceneCamera {
  if (![dx,dy,width,height].every(Number.isFinite) || width <= 0 || height <= 0) throw new Error("Invalid scene movement");
  const camera = sceneCamera(value);
  return sceneCamera({ ...camera, x: camera.x - dx * 100 / (width * camera.zoom), y: camera.y - dy * 100 / (height * camera.zoom) });
}
