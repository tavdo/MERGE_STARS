import { api } from "@/lib/axios";
import type { ApiResponse } from "@/shared/types/api.types";
import type { CatalogItem } from "@/features/catalog/api/catalog.api";
export type Measurements = Partial<
  Record<
    | "height"
    | "shoulders"
    | "chest"
    | "waist"
    | "hips"
    | "neck"
    | "wrist"
    | "finger"
    | "foot"
    | "head",
    number
  >
>;
export type FitProfile = {
  measurements: Measurements;
  source: string;
  consentedAt: string;
  updatedAt: string;
};
export type DesignProposal = {
  id: string;
  parentProposalId?: string | null;
  visibility?: 'PRIVATE';
  publicationStatus?: 'PRIVATE' | 'PENDING_RIGHTS_REVIEW';
  sourceProductId: string;
  rootProductId: string;
  versionId: string;
  newProductId: null;
  sourceVersion: string;
  brandLineId: string | null;
  houseId: string | null;
  preferences: {
    material?: string;
    initials?: string;
    notes?: string;
    measurements: Measurements;
  };
  verificationStatus: "NOT_REQUESTED" | "REQUESTED";
  createdAt: string;
  truthState: "CONCEPT";
  orderAllowed: false;
};
export type CoreTruth = {
  truthState: "CONCEPT";
  sourceVersion: string;
  calculationStatus: "UNAVAILABLE";
  physicalWeightGrams: null;
  pricingWeightKg: null;
  estimatedPriceMinor: null;
  orderAllowed: false;
  likes: number;
  missing: string[];
};
export type Pulse = {
  qrScans: number | null;
  profileViews: number | null;
  likes: number;
  saves: number;
  designs: number;
  verificationRequests: number;
  messages: null;
  production: null;
  passportEvents: null;
};
const data = async <T>(request: Promise<{ data: ApiResponse<T> }>) =>
  (await request).data.data;
export const coreApi = {
  saved: () =>
    data(
      api.get<
        ApiResponse<
          (CatalogItem & { collectionSlug: string; visibility: string })[]
        >
      >("/experience/saved"),
    ),
  fit: () => data(api.get<ApiResponse<FitProfile | null>>("/experience/fit")),
  saveFit: (measurements: Measurements) =>
    data(
      api.patch<ApiResponse<FitProfile>>("/experience/fit", {
        consent: true,
        measurements,
      }),
    ),
  removeFit: () =>
    data(api.delete<ApiResponse<{ ok: boolean }>>("/experience/fit")),
  product: (id: string) =>
    data(api.get<ApiResponse<CoreTruth>>(`/experience/products/${id}`)),
  designs: () =>
    data(api.get<ApiResponse<DesignProposal[]>>("/experience/designs")),
  createDesign: (payload: {
    sourceProductId: string;
    parentProposalId?: string;
    material?: string;
    initials?: string;
    notes?: string;
  }) =>
    data(api.post<ApiResponse<DesignProposal>>("/experience/designs", payload)),
  personalMuseum: (page: number, signal?: AbortSignal) => data(api.get<ApiResponse<PersonalMuseumData>>('/experience/museum', { params: { page }, signal })),
  requestPublication: (id: string) => data(api.post<ApiResponse<DesignProposal>>(`/experience/designs/${id}/publication-request`, { consent: true })),
  verify: (id: string) =>
    data(
      api.post<ApiResponse<DesignProposal>>(
        `/experience/designs/${id}/verification`,
      ),
    ),
  interaction: (id: string) =>
    data(
      api.get<ApiResponse<{ liked: boolean; saved: boolean }>>(
        `/experience/products/${id}/interaction`,
      ),
    ),
  interact: (id: string, kind: "LIKE" | "SAVE", active: boolean) =>
    data(
      api.patch<ApiResponse<{ liked: boolean; saved: boolean }>>(
        `/experience/products/${id}/interaction`,
        { kind, active },
      ),
    ),
  pulse: () => data(api.get<ApiResponse<Pulse>>("/experience/pulse")),
};

export type PersonalMuseumData = {
  identity: { masterId: string; ownerId: string; kind: 'PERSONAL_BRAND_MUSEUM'; officialPartner: false };
  products: (CatalogItem & { collection: { id: string; title: string; slug: string; visibility: 'PRIVATE' | 'PUBLIC'; category: string } })[];
  versions: DesignProposal[];
  page: number; pageSize: number; productCount: number; versionCount: number; hasMore: boolean;
};
