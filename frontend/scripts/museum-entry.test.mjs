import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../src/living-museum/${path}`, import.meta.url), 'utf8');
const gate = read('components/museum-gate.tsx');
const museum = read('components/museum.tsx');
const css = read('canonical-logo.css');
assert.match(gate, /MUSEUM_ENTRY_DURATION = 5600/);
assert.match(museum, /reducedMotion \? 0 : MUSEUM_ENTRY_DURATION/);
assert.match(css, /joined-open-gold var\(--entry-duration\)/);
assert.match(css, /joined-open-silver var\(--entry-duration\)/);
assert.match(css, /rotateY\(-38deg\)/);
assert.match(css, /rotateY\(38deg\)/);
assert.match(museum, /onAnimationEnd=\{\(\) => setArriving\(false\)\}/);
assert.match(css, /museum-soft-handoff 1\.8s/);
console.log('Slow symmetric opening, shared timing and soft arrival verified.');
