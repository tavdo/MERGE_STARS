import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export type ConfiguratorProductType = {
  key: string
  label: string
  meshyStyle: string
  defaultWeightG: number
}

export type CoinPackageConfig = {
  id: string
  label: string
  packageKg: number
  totalWeightG: number
  caseWeightG: number
  productCapacityG: number
  isDefault: boolean
  isActive: boolean
}

export type ConfiguratorProduct = {
  id: string
  sessionId: string
  productType: string
  title: string
  prompt: string | null
  meshyJobId: string | null
  model3dUrl: string | null
  status: string
  estimatedWeightG: number | null
  verifiedWeightG: number | null
  weightG: number | null
  visibility: 'private' | 'catalog'
  catalogItemId: string | null
  approvedAt: string | null
}

export type ConfiguratorSession = {
  id: string
  packageKg: number
  caseWeightG: number
  productCapacityG: number
  sourceBrandHouseId: string | null
  sourceQrRef: string | null
  status: 'draft' | 'finalized' | 'locked'
  usedWeightG: number
  remainingWeightG: number
  caseLayoutJson?: Record<string, unknown> | null
  finalizedAt: string | null
  products: ConfiguratorProduct[]
}

export const configuratorApi = {
  productTypes: () =>
    api.get<ApiResponse<ConfiguratorProductType[]>>('/coin-configurator/product-types'),

  packageConfigs: () =>
    api.get<ApiResponse<CoinPackageConfig[]>>('/coin-configurator/package-configs'),

  activeSession: () =>
    api.get<ApiResponse<ConfiguratorSession | null>>('/coin-configurator/session/active'),

  createSession: (body: {
    packageKg?: number
    packageConfigId?: string
    sourceBrandHouseId?: string
    sourceQrRef?: string
  }) => api.post<ApiResponse<ConfiguratorSession>>('/coin-configurator/sessions', body),

  getSession: (id: string) =>
    api.get<ApiResponse<ConfiguratorSession>>(`/coin-configurator/sessions/${id}`),

  addProduct: (sessionId: string, productType: string) =>
    api.post<ApiResponse<ConfiguratorSession>>(`/coin-configurator/sessions/${sessionId}/products`, {
      productType,
    }),

  updateProduct: (
    sessionId: string,
    productId: string,
    body: {
      prompt?: string
      meshyJobId?: string
      model3dUrl?: string
      status?: string
    },
  ) =>
    api.patch<ApiResponse<ConfiguratorSession>>(
      `/coin-configurator/sessions/${sessionId}/products/${productId}`,
      body,
    ),

  approveProduct: (
    sessionId: string,
    productId: string,
    body?: { visibility?: 'private' | 'catalog'; estimatedWeightG?: number },
  ) =>
    api.post<ApiResponse<ConfiguratorSession>>(
      `/coin-configurator/sessions/${sessionId}/products/${productId}/approve`,
      body ?? {},
    ),

  finalize: (sessionId: string) =>
    api.post<ApiResponse<ConfiguratorSession>>(`/coin-configurator/sessions/${sessionId}/finalize`),

  adminPackageConfigs: () =>
    api.get<ApiResponse<CoinPackageConfig[]>>('/admin/coin-configurator/package-configs'),

  adminUpdatePackageConfig: (id: string, body: Partial<CoinPackageConfig>) =>
    api.patch<ApiResponse<CoinPackageConfig>>(`/admin/coin-configurator/package-configs/${id}`, body),

  adminPendingProducts: () =>
    api.get<ApiResponse<ConfiguratorProduct[]>>('/admin/coin-configurator/pending-products'),

  adminVerifyWeight: (productId: string, verifiedWeightG: number) =>
    api.post<ApiResponse<unknown>>(`/admin/coin-configurator/products/${productId}/verify-weight`, {
      verifiedWeightG,
    }),

  getPassport: (publicId: string) =>
    api.get<ApiResponse<Record<string, unknown>>>(`/coin-configurator/passports/${publicId}`),
}
