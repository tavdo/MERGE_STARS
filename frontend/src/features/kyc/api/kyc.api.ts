import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface KycDocumentItem {
  id: string
  userId: string
  originalName: string
  mimeType: string
  size: number
  documentType: 'id_front' | 'id_back' | 'other'
  status: string
  createdAt: string
}

export const kycApi = {
  listMine: () =>
    api.get<ApiResponse<KycDocumentItem[]>>('/users/me/kyc/documents'),

  upload: (
    file: File,
    documentType: 'id_front' | 'id_back' | 'other' = 'other',
    accessToken?: string,
  ) => {
    const form = new FormData()
    form.append('file', file)
    form.append('documentType', documentType)
    return api.post<ApiResponse<KycDocumentItem>>('/users/me/kyc/documents', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })
  },

  adminList: (userId: string) =>
    api.get<ApiResponse<KycDocumentItem[]>>(`/admin/users/${userId}/kyc/documents`),

  adminFileUrl: (docId: string) => `/api/admin/kyc/documents/${docId}/file`,
}
