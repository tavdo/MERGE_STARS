import { mkdir, writeFile } from 'node:fs/promises';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createConceptModel } from '../src/living-museum/lib/concept-models.ts';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(value => { this.result=value; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(value => { this.result=`data:${blob.type};base64,${Buffer.from(value).toString('base64')}`; this.onloadend?.(); }); }
};
const directory=new URL('../public/living-museum/models/',import.meta.url);
await mkdir(directory,{recursive:true});
for(const [kind,name] of [['bags','bag'],['watches','watch'],['fashion','gown']]) {
  const model=createConceptModel(kind);
  const result=await new GLTFExporter().parseAsync(model,{binary:true});
  await writeFile(new URL(`concept-${name}.glb`,directory),Buffer.from(result));
  console.log(`${name}: ${result.byteLength} bytes, CONCEPT, interpreted geometry`);
}
