import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../src/components/catalog/MeshyAIPanel.tsx', import.meta.url), 'utf8')
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
function render(onGenerate) {
  const changes = [], module = { exports: {} }; let stateIndex = 0
  const react = { useId: () => 'qa-prompt', useRef: value => ({ current: value }), useState: initial => { const index = stateIndex++; return [index === 0 ? 'A watch concept' : initial, value => changes.push({ index, value })] } }
  new Function('require', 'module', 'exports', code)(name => name === 'react' ? react : name === 'react-i18next' ? { useTranslation: () => ({ t: (_, options) => options?.defaultValue ?? 'label' }) } : name === './Model3DViewer' ? { default: () => null } : require(name), module, module.exports)
  const tree = module.exports.default({ onGenerate })
  function find(node) { if (!node || typeof node !== 'object') return null; if (node.props?.className === 'catalog-meshy-generate') return node; for (const child of [node.props?.children].flat(Infinity)) { const found = find(child); if (found) return found } return null }
  return { button: find(tree), changes }
}
const unavailable = render(); assert.equal(unavailable.button.props.disabled, true)
await unavailable.button.props.onClick(); assert.equal(unavailable.changes.length, 0)
for (const result of [undefined, { previewUrl: null }, { previewUrl: 'javascript:alert(1)' }]) {
  const panel = render(async () => result); await panel.button.props.onClick()
  assert(panel.changes.some(change => change.value === 'error'))
  assert(!panel.changes.some(change => change.value === 'done'))
}
let calls = 0
const realResult = render(async () => { calls++; return { previewUrl: 'https://example.com/model.glb' } })
await Promise.all([realResult.button.props.onClick(), realResult.button.props.onClick()])
assert.equal(calls, 1); assert(realResult.changes.some(change => change.value === 'done'))
assert(!source.includes('setTimeout')); assert(!source.includes('setProgress'))
const parent = readFileSync(new URL('../src/components/catalog/CatalogItemStudio.tsx', import.meta.url), 'utf8')
assert(!parent.includes('demo returns null preview'))
for (const language of ['ka', 'ru', 'en']) {
  const locale = readFileSync(new URL('../src/i18n/locales/' + language + '.ts', import.meta.url), 'utf8')
  assert(!/sub: '(პატენტირებული ინოვაცია|Запатентованные инновации|Patented Innovation)'/.test(locale))
}
console.log('PASS: no provider means disabled; missing/unsafe result means error; no simulated progress or false completion; duplicate clicks share one request; unsupported patent subtitles removed. Provider/model-load E2E not asserted.')
