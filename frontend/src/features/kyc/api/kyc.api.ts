import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface KycDocumentItem {
  id: string
  userId: string
  originalName: string
  mimeType: string
  size: number
  status: string
  createdAt: string
}

export const kycApi = {
  listMine: () =>
    api.get<ApiResponse<KycDocumentItem[]>>('/users/me/kyc/documents'),

  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<KycDocumentItem>>('/users/me/kyc/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  adminList: (userId: string) =>
    api.get<ApiResponse<KycDocumentItem[]>>(`/admin/users/${userId}/kyc/documents`),

  adminFileUrl: (docId: string) => `/api/admin/kyc/documents/${docId}/file`,
}
