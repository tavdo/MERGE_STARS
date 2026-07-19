import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface CatalogItem {
  id: string
  collectionId: string
  title: string
  description: string | null
  metalType: string | null
  imageUrl: string | null
  model3dUrl: string | null
  model3dFormat: string | null
  hasImage?: boolean
  hasModel3d?: boolean
  status: 'ACTIVE' | 'ARCHIVED'
  priceUsd: number | null
  createdAt: string
  updatedAt: string
}

export interface CatalogCollection {
  id: string
  userId: string
  title: string
  description: string | null
  slug: string
  visibility: CatalogVisibility
  itemCount: number
  createdAt: string
  updatedAt: string
  ownerName?: string
  brandLineId?: string | null
}

export type CatalogVisibility = 'PUBLIC' | 'PRIVATE'

export interface CatalogCollectionDetail extends CatalogCollection {
  items: CatalogItem[]
}

const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export function catalogItemImageUrl(item: CatalogItem) {
  if (!item.imageUrl) return null
  if (item.imageUrl.startsWith('http')) return item.imageUrl
  if (item.hasImage) return `${apiBase}/catalog/items/${item.id}/image/file`
  return null
}

export function catalogItemModelUrl(item: CatalogItem) {
  if (!item.model3dUrl && !item.hasModel3d) return null
  if (item.model3dUrl?.startsWith('http')) return item.model3dUrl
  if (item.hasModel3d) return `${apiBase}/catalog/items/${item.id}/model3d/file`
  return null
}

export const catalogApi = {
  listMine: () =>
    api.get<ApiResponse<CatalogCollection[]>>('/catalog/collections'),

  getOne: (id: string) =>
    api.get<ApiResponse<CatalogCollectionDetail>>(`/catalog/collections/${id}`),

  create: (payload: { title: string; description?: string; visibility: CatalogVisibility }) =>
    api.post<ApiResponse<CatalogCollection>>('/catalog/collections', payload),

  update: (id: string, payload: Partial<{ title: string; description: string; visibility: CatalogVisibility }>) =>
    api.patch<ApiResponse<CatalogCollection>>(`/catalog/collections/${id}`, payload),

  remove: (id: string) =>
    api.delete<ApiResponse<{ ok: boolean }>>(`/catalog/collections/${id}`),

  addItem: (collectionId: string, payload: { title: string; description?: string; metalType?: string; imageUrl?: string; priceUsd?: number }) =>
    api.post<ApiResponse<CatalogItem>>(`/catalog/collections/${collectionId}/items`, payload),

  uploadImage: (itemId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<CatalogItem>>(`/catalog/items/${itemId}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadModel3d: (itemId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<CatalogItem>>(`/catalog/items/${itemId}/model3d`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600_000,
    })
  },

  updateItem: (itemId: string, payload: Partial<{ title: string; description: string; metalType: string; imageUrl: string; status: 'ACTIVE' | 'ARCHIVED'; priceUsd: number | null }>) =>
    api.patch<ApiResponse<CatalogItem>>(`/catalog/items/${itemId}`, payload),

  removeItem: (itemId: string) =>
    api.delete<ApiResponse<{ ok: boolean }>>(`/catalog/items/${itemId}`),

  listPublic: () =>
    api.get<ApiResponse<CatalogCollection[]>>('/catalog/public'),

  getPublic: (slug: string) =>
    api.get<ApiResponse<CatalogCollectionDetail>>(`/catalog/public/${slug}`),
}
