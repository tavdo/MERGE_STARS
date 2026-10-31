import { api } from '@/lib/axios'
import { projectCatalog, projectCollection, projectPrices, unavailableCoreCapability } from './lib/core-contract'

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json' },
})

// Adapt the hosted read interface to this project's API without manufacturing records.
export const museumFetch: typeof fetch = async (input, init) => {
  const value = input instanceof Request ? input.url : String(input)
  const url = new URL(value, window.location.origin)
  if (url.origin === window.location.origin && /^\/api\/catalog\/items\/[0-9a-f-]{36}\/model3d\/file$/i.test(url.pathname)) {
    try {
      const response = await api.get(url.pathname.slice(4), { signal: init?.signal ?? undefined, responseType: 'arraybuffer' })
      return new Response(response.data, { headers: { 'Content-Type': 'model/gltf-binary' } })
    } catch (error) {
      if (init?.signal?.aborted) throw error
      return json({ error: 'PRIVATE_MODEL_UNAVAILABLE' }, 503)
    }
  }
  if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/core/')) return fetch(input, init)
  const operation = url.pathname.slice('/api/core/'.length)
  try {
    const options = { signal: init?.signal ?? undefined }
    const retrieved_at = new Date().toISOString()
    if (operation === 'catalog') return json({ ...projectCatalog((await api.get('/catalog/public', options)).data), retrieved_at })
    if (operation === 'collection') {
      const slug = url.searchParams.get('slug') ?? ''
      if (!/^[a-zA-Z0-9_-]{1,120}$/.test(slug)) return json({ error: 'INVALID_CORE_SLUG' }, 400)
      return json({ ...projectCollection((await api.get(`/catalog/public/${encodeURIComponent(slug)}`, options)).data, slug), retrieved_at })
    }
    if (operation === 'prices') return json({ ...projectPrices((await api.get('/metals/live', options)).data), retrieved_at })
    if (operation === 'model') {
      const id = url.searchParams.get('id') ?? ''
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'MODEL_SOURCE_INVALID' }, 400)
      const response = await api.get(`/catalog/public/items/${id}/model3d`, { ...options, responseType: 'arraybuffer' })
      return new Response(response.data, { headers: { 'Content-Type': 'model/gltf-binary' } })
    }
    return json({ error: 'CORE_DEPENDENCY_REQUIRED', ...unavailableCoreCapability(operation) }, 503)
  } catch (error) {
    if (init?.signal?.aborted) throw error
    return json({ error: 'CORE_UNAVAILABLE', available: false }, 503)
  }
}
