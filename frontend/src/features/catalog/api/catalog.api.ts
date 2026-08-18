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
  house?: string | null
  lifecycle?: string
  ownership?: string
  houseLabel?: string | null
  cluster?: string | null
  collectionTitle?: string | null
  collectionSlug?: string | null
  inBrandRoom?: boolean
  source?: 'master' | 'owned'
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
  category?: CatalogCategory
  itemCount: number
  createdAt: string
  updatedAt: string
  ownerName?: string
  brandLineId?: string | null
  mergeId?: string | null
  brandName?: string | null
  logoUrl?: string | null
  avatarUrl?: string | null
}

export type CatalogVisibility = 'PUBLIC' | 'PRIVATE'
export type CatalogCategory =
  | 'jewelry'
  | 'accessories'
  | 'souvenirs'
  | 'sanitaryware'
  | 'stationery'
  | 'construction'
  | 'more'

export interface CatalogCategoryStat {
  key: CatalogCategory
  count: number
}

export interface CatalogCollectionDetail extends CatalogCollection {
  items: CatalogItem[]
}

const apiBase = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000')).replace(
  /\/$/,
  '',
)

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

export type CatalogItemPublicMedia = Pick<CatalogItem, 'id'> &
  Partial<Pick<CatalogItem, 'imageUrl' | 'model3dUrl' | 'hasImage' | 'hasModel3d'>>

/** Public browse — no auth required (item must be in a PUBLIC collection) */
export function catalogItemPublicImageUrl(item: CatalogItemPublicMedia) {
  if (item.imageUrl?.startsWith('http')) return item.imageUrl
  if (item.imageUrl?.startsWith('/api/')) return item.imageUrl
  if (item.hasImage || (item.imageUrl && !item.imageUrl.startsWith('http'))) {
    return `${apiBase}/catalog/public/items/${item.id}/image`
  }
  return null
}

export function catalogItemPublicModelUrl(item: CatalogItemPublicMedia) {
  if (item.model3dUrl?.startsWith('http')) return item.model3dUrl
  if (item.hasModel3d || (item.model3dUrl && !item.model3dUrl.startsWith('http'))) {
    return `${apiBase}/catalog/public/items/${item.id}/model3d`
  }
  return null
}

export const catalogApi = {
  listMine: () =>
    api.get<ApiResponse<CatalogCollection[]>>('/catalog/collections'),

  getOne: (id: string) =>
    api.get<ApiResponse<CatalogCollectionDetail>>(`/catalog/collections/${id}`),

  create: (payload: {
    title: string
    description?: string
    visibility: CatalogVisibility
    category?: CatalogCategory
  }) => api.post<ApiResponse<CatalogCollection>>('/catalog/collections', payload),

  update: (
    id: string,
    payload: Partial<{
      title: string
      description: string
      visibility: CatalogVisibility
      category: CatalogCategory
    }>,
  ) => api.patch<ApiResponse<CatalogCollection>>(`/catalog/collections/${id}`, payload),

  remove: (id: string) =>
    api.delete<ApiResponse<{ ok: boolean }>>(`/catalog/collections/${id}`),

  addItem: (
    collectionId: string,
    payload: {
      title: string
      description?: string
      metalType?: string
      imageUrl?: string
      priceUsd?: number
      meshyJobId?: string
    },
  ) => api.post<ApiResponse<CatalogItem>>(`/catalog/collections/${collectionId}/items`, payload),

  uploadImage: (itemId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<CatalogItem>>(`/catalog/items/${itemId}/image`, form)
  },

  uploadModel3d: (itemId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<CatalogItem>>(`/catalog/items/${itemId}/model3d`, form, {
      timeout: 600_000,
    })
  },

  updateItem: (itemId: string, payload: Partial<{ title: string; description: string; metalType: string; imageUrl: string; status: 'ACTIVE' | 'ARCHIVED'; priceUsd: number | null }>) =>
    api.patch<ApiResponse<CatalogItem>>(`/catalog/items/${itemId}`, payload),

  moveItem: (itemId: string, collectionId: string) =>
    api.post<ApiResponse<CatalogItem>>(`/catalog/items/${itemId}/move`, { collectionId }),

  removeItem: (itemId: string) =>
    api.delete<ApiResponse<{ ok: boolean }>>(`/catalog/items/${itemId}`),

  listPublic: (category?: string) =>
    api.get<ApiResponse<CatalogCollection[]>>('/catalog/public', {
      params: category ? { category } : undefined,
    }),

  categoryStats: () =>
    api.get<ApiResponse<CatalogCategoryStat[]>>('/catalog/public/categories'),

  getPublic: (slug: string) =>
    api.get<ApiResponse<CatalogCollectionDetail>>(`/catalog/public/${slug}`),

  masterHouses: () =>
    api.get<
      ApiResponse<{
        clusters: Array<{
          key: string
          label: string
          houses: Array<{ key: string; label: string; cluster: string }>
        }>
        houses: Array<{ key: string; label: string; cluster: string }>
      }>
    >('/catalog/master/houses'),

  masterProducts: (params?: { q?: string; house?: string; cluster?: string; collectionId?: string }) =>
    api.get<
      ApiResponse<{
        products: CatalogItem[]
        collections: Array<{ id: string; title: string; slug: string }>
      }>
    >('/catalog/master/products', { params }),

  brandRoomCatalog: () =>
    api.get<ApiResponse<Array<CatalogItem & { pickId?: string; available?: boolean; catalogItemId?: string }>>>(
      '/catalog/brand-room/catalog',
    ),

  addBrandRoomPick: (catalogItemId: string) =>
    api.post<ApiResponse<{ ok: boolean; already: boolean }>>('/catalog/brand-room/picks', { catalogItemId }),

  removeBrandRoomPick: (itemId: string) =>
    api.delete<ApiResponse<{ ok: boolean }>>(`/catalog/brand-room/picks/${itemId}`),

  adminMasterList: () =>
    api.get<ApiResponse<CatalogItem[]>>('/catalog/master/admin'),

  adminMasterCreate: (payload: { title: string; house: string; description?: string; metalType?: string; priceUsd?: number }) =>
    api.post<ApiResponse<CatalogItem>>('/catalog/master/admin', payload),

  adminMasterUpdate: (itemId: string, payload: { lifecycle?: string; status?: string; house?: string; title?: string }) =>
    api.patch<ApiResponse<CatalogItem>>(`/catalog/master/admin/${itemId}`, payload),

  adminMasterUploadImage: (itemId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<CatalogItem>>(`/catalog/master/admin/${itemId}/image`, form)
  },

  adminMasterUploadModel3d: (itemId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<CatalogItem>>(`/catalog/master/admin/${itemId}/model3d`, form, {
      timeout: 600_000,
    })
  },
}
