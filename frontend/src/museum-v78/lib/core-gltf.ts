import { approvedModelURL } from "./core-model-asset.ts";
import { MAX_CORE_MODEL_BYTES } from "./core-model-limits.ts";

const limit = MAX_CORE_MODEL_BYTES;
// GLB is inspected before the loader runs. External model resources may not
// escape the approved CORE asset into arbitrary URLs or trackers.
export function inspectCoreGLB(bytes: ArrayBuffer) {
  if (bytes.byteLength < 20 || bytes.byteLength > limit) throw Error("MODEL_SIZE_INVALID");
  const view = new DataView(bytes);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== bytes.byteLength) throw Error("MODEL_FORMAT_UNSUPPORTED");
  let offset = 12, json: Record<string, any> | null = null, binary = false;
  while (offset < bytes.byteLength) {
    if (offset + 8 > bytes.byteLength) throw Error("MODEL_CHUNK_INVALID");
    const length = view.getUint32(offset, true), type = view.getUint32(offset + 4, true); offset += 8;
    if (length % 4 || offset + length > bytes.byteLength) throw Error("MODEL_CHUNK_INVALID");
    if (type === 0x4e4f534a) {
      if (json || length > 2 * 1024 * 1024) throw Error("MODEL_JSON_INVALID");
      json = JSON.parse(new TextDecoder().decode(bytes.slice(offset, offset + length)));
    } else if (type === 0x004e4942) { if (binary) throw Error("MODEL_BIN_DUPLICATE"); binary = true; }
    offset += length;
  }
  if (!json || json.asset?.version !== "2.0" || !binary || !Array.isArray(json.meshes) || !json.meshes.length) throw Error("MODEL_GEOMETRY_REQUIRED");
  if (!Array.isArray(json.buffers) || json.buffers.length !== 1 || json.buffers.some((b: any) => b.uri)) throw Error("MODEL_EXTERNAL_RESOURCE_REJECTED");
  const images = json.images ?? [];
  if (!Array.isArray(images) || images.length > 64 || images.some((i: any) => i.uri && !/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(i.uri))) throw Error("MODEL_EXTERNAL_RESOURCE_REJECTED");
  if ((json.nodes?.length ?? 0) > 2048 || json.meshes.length > 512 || (json.materials?.length ?? 0) > 256) throw Error("MODEL_TOO_COMPLEX");
  let vertices = 0;
  for (const mesh of json.meshes) {
    if (!Array.isArray(mesh.primitives) || mesh.primitives.length > 128) throw Error("MODEL_GEOMETRY_INVALID");
    for (const p of mesh.primitives) {
      if (![4, 5, 6].includes(p.mode ?? 4)) throw Error("MODEL_GEOMETRY_UNSUPPORTED");
      const a = json.accessors?.[p.attributes?.POSITION];
      if (!a || a.type !== "VEC3" || !Number.isSafeInteger(a.count) || a.count <= 0) throw Error("MODEL_GEOMETRY_INVALID");
      vertices += a.count;
    }
  }
  if (vertices > 1500000) throw Error("MODEL_TOO_COMPLEX");
  // Required compressed assets need their authorized decoder. Do not replace
  // a missing decoder with a photograph or declare a generated model READY.
  const unsupported = ["KHR_draco_mesh_compression", "EXT_meshopt_compression", "KHR_texture_basisu"];
  if ((json.extensionsRequired ?? []).some((name: string) => unsupported.includes(name))) throw Error("MODEL_DECODER_REQUIRED");
  const visiting = new Set<number>(), visited = new Set<number>();
  function visit(index: number, depth: number) {
    if (!Number.isInteger(index) || !json?.nodes?.[index] || depth > 64 || visiting.has(index)) throw Error("MODEL_NODE_INVALID");
    if (visited.has(index)) return; visiting.add(index);
    for (const child of json.nodes[index].children ?? []) visit(child, depth + 1);
    visiting.delete(index); visited.add(index);
  }
  for (let i = 0; i < (json.nodes?.length ?? 0); i++) visit(i, 0);
  return { vertices, textures: images.length };
}

export async function loadCoreGLB(url: string, signal: AbortSignal, transport: typeof fetch = fetch, onProgress?: (percent: number) => void) {
  const source = new URL(approvedModelURL(url)), id = source.pathname.split("/").at(-2)!;
  const response = await transport(`/api/core/model?id=${encodeURIComponent(id)}`, { signal, credentials: "same-origin", redirect: "manual", headers: { Accept: "model/gltf-binary, application/octet-stream" } });
  if (!response.ok || response.status >= 300 || Number(response.headers.get("content-length") ?? 0) > limit) throw Error("MODEL_UNAVAILABLE");
  const reader = response.body?.getReader(); if (!reader) throw Error("MODEL_UNAVAILABLE");
  const prefix: Uint8Array[] = []; let length = 0, bytes: Uint8Array<ArrayBuffer> | null = null, reported = -1;
  try { while (true) { const next = await reader.read(); if (next.done) break;
    const before = length; length += next.value.byteLength;
    if (length > limit || (bytes && length > bytes.length)) throw Error("MODEL_TOO_LARGE");
    if (bytes) bytes.set(next.value, before);
    else { prefix.push(next.value);
    if (length >= 12) {
      const header = new Uint8Array(12); let copied = 0;
      for (const part of prefix) { const count = Math.min(12 - copied, part.length); header.set(part.subarray(0, count), copied); copied += count; if (copied === 12) break; }
      const view = new DataView(header.buffer), declared = view.getUint32(8, true);
      if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 || declared < 20 || declared > limit || length > declared) throw Error("MODEL_FORMAT_UNSUPPORTED");
      bytes = new Uint8Array(declared); let offset = 0; for (const part of prefix) { bytes.set(part, offset); offset += part.length; } prefix.length = 0;
    } }
    if (bytes) { const percent = Math.floor(length / bytes.length * 100); if (percent !== reported) { reported = percent; onProgress?.(percent); } }
  } } catch (error) { await reader.cancel().catch(() => {}); throw error; } finally { reader.releaseLock(); }
  if (!bytes || bytes.length !== length) throw Error("MODEL_TRUNCATED");
  inspectCoreGLB(bytes.buffer); return bytes.buffer;
}
