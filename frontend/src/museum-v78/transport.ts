import axios from 'axios'
import { api } from '@/lib/axios'

// Keep the exported museum's HTTP contracts on the existing verified CORE session.
// This never trusts a caller-supplied user/owner header.
export const museumV78Fetch: typeof fetch = async (input, init) => {
  const value = input instanceof Request ? input.url : String(input)
  const url = new URL(value, window.location.origin)
  if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) {
    return window.fetch(input, init)
  }
  const own = ['/api/designs', '/api/atelier', '/api/house-scenes', '/api/ai-manager', '/api/health', '/api/system']
  const path = url.pathname === '/api/core/authentication' ? '/users/me' : own.includes(url.pathname)
    ? '/museum-v78/' + url.pathname.slice('/api/'.length)
    : url.pathname.slice('/api'.length)
  try {
    const response = await api.request({
      url: path + url.search,
      method: init?.method || 'GET',
      data: typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body,
      signal: init?.signal ?? undefined,
      responseType: /\/core\/model$/.test(path) ? 'arraybuffer' : 'json',
    })
    const binary = response.data instanceof ArrayBuffer
    return new Response(binary ? response.data : JSON.stringify(response.data), {
      status: response.status,
      headers: { 'Content-Type': binary ? 'model/gltf-binary' : 'application/json', 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    if (init?.signal?.aborted) throw error
    const status = axios.isAxiosError(error) ? error.response?.status ?? 503 : 503
    const value = axios.isAxiosError(error) ? error.response?.data : undefined
    const payload = typeof value?.error === 'string' ? value : {
      error: status === 401 ? 'AUTH_REQUIRED' : status === 403 ? 'ORIGIN_REJECTED' : 'STORAGE_UNAVAILABLE',
    }
    return Response.json(payload, { status, headers: { 'Cache-Control': 'private, no-store' } })
  }
}
