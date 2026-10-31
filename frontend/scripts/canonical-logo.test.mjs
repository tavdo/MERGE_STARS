import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const hash = path => createHash('sha256').update(readFileSync(new URL('../' + path, import.meta.url))).digest('hex');
assert.equal(hash('src/assets/assistant-logo.png'), hash('public/museum/merge-master-logo-canonical.png'));
for (const path of ['src/living-museum/components/museum.tsx', 'src/living-museum/Transparency.tsx']) {
  assert.ok(read(path).includes('MergeMasterLogo'));
  assert.doesNotMatch(read(path), /merge-wordmark\.png|merge-mark\.png/);
}
assert.match(read('index.html'), /rel="icon"[^>]+merge-master-logo-canonical\.png/);
assert.doesNotMatch(read('src/living-museum/components/museum-gate.tsx'), /optimized\/entrance|entrance-dual\.png|entrance-closed\.png/);
for (const asset of ['founder-portal-mirrored-terminals.png', 'entrance-canonical-open.png', 'founder-museum-arrival.png']) {
  assert.ok(read('src/living-museum/components/museum-gate.tsx').includes(asset));
}
for (const path of ['src/living-museum/lib/museum-three-scene.ts', 'src/living-museum/lib/museum-webgl.ts']) {
  assert.doesNotMatch(read(path), /merge-master-logo-canonical\.png|emblemMesh|register\(emblem/);
}
console.log('Canonical UI logo, mirrored door leaves and no duplicate room medallion verified.');
const gate = read('src/living-museum/components/museum-gate.tsx');
assert.match(gate, /src=\{closed\}/);
assert.doesNotMatch(gate, /DoorIdentity|joined-door-lettering/);
assert.doesNotMatch(gate, /DoorWording|door-wording-cleanup/);
assert.match(read('src/living-museum/canonical-logo.css'), /polygon\(0 0,50% 0,50% 100%,0 100%\)/);
assert.match(read('src/living-museum/canonical-logo.css'), /polygon\(50% 0,100% 0,100% 100%,50% 100%\)/);
