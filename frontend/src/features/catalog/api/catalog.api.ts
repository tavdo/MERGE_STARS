import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export type CatalogVisibility = 'PUBLIC' | 'PRIVATE'

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

export interface CatalogItem {
  id: string
  collectionId: string
  title: string
  description: string | null
  metalType: string | null
  imageUrl: string | null
  status: 'ACTIVE' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export interface CatalogCollectionDetail extends CatalogCollection {
  items: CatalogItem[]
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

  addItem: (collectionId: string, payload: { title: string; description?: string; metalType?: string; imageUrl?: string }) =>
    api.post<ApiResponse<CatalogItem>>(`/catalog/collections/${collectionId}/items`, payload),

  updateItem: (itemId: string, payload: Partial<{ title: string; description: string; metalType: string; imageUrl: string; status: 'ACTIVE' | 'ARCHIVED' }>) =>
    api.patch<ApiResponse<CatalogItem>>(`/catalog/items/${itemId}`, payload),

  removeItem: (itemId: string) =>
    api.delete<ApiResponse<{ ok: boolean }>>(`/catalog/items/${itemId}`),

  listPublic: () =>
    api.get<ApiResponse<CatalogCollection[]>>('/catalog/public'),

  getPublic: (slug: string) =>
    api.get<ApiResponse<CatalogCollectionDetail>>(`/catalog/public/${slug}`),
}
