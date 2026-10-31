import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)
function load(file, overrides = {}) { const module = { exports: {} }; const source = readFileSync(new URL('../src/experience/' + file, import.meta.url), 'utf8'); const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText; new Function('require', 'module', 'exports', code)(name => overrides[name] ?? require(name), module, module.exports); return module.exports }
const content = load('content.ts'), houses = load('lifestyle-houses.ts', { './content': content })
assert.deepEqual(houses.lifestyleHouses.map(house => house.id), ['renaissance', 'wedding', 'family'])
assert.equal(houses.lifestyleHouse('unknown').id, 'family')
assert.equal(houses.lifestyleHouse(null).id, 'family')
for (const house of houses.lifestyleHouses) for (const category of house.categories) {
  assert(content.districts.some(value => value[0] === category))
  const url = new URL(houses.lifestyleDesignLink(house.id, category), 'http://localhost')
  assert.equal(url.pathname, '/create')
  assert.equal(url.searchParams.get('application'), house.name + ' / ' + category)
}
assert.equal(houses.lifestyleDesignLink('invented', 'fashion'), null)
assert.equal(houses.lifestyleDesignLink('family', 'mobility'), null)
assert(existsSync(new URL('../public/museum/lifestyle-megapolis-20261029.png', import.meta.url)))
console.log('PASS: three lifestyle experiences, existing category routes, bounded studio context, unknown input rejection and packaged image. Browser and real Meshy/CORE E2E not asserted.')
