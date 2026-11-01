import { z } from "zod";
import { catalog } from "./museum-domain";

// Customer intent in an existing experience draft. Never an approved material,
// formulation, density, weight, price or replacement for CORE Material Lab.
export const materialPreferenceSchema = z.object({
  base_filament: z.string().trim().min(1).max(160),
  precious_metal: z.enum(["gold", "silver", "both"]),
  integration: z.enum(["blend", "mosaic", "surface", "separate_component", "lab_recommendation"]),
  intended_use: z.string().trim().min(1).max(160),
  details: z.string().trim().max(500),
}).strict();

export const configSchema = z.object({
  material: z.enum(["mixed", "silver", "gold"]),
  scale: z.enum(["fine", "medium"]),
  name: z.string().trim().max(60),
  material_preference: materialPreferenceSchema.optional(),
}).strict();

export const createDraftSchema = z.object({
  source_reference_id: z.enum(["MERGE-EYE-001", "MERGE-CASE-001"]),
  parent_draft_id: z.string().uuid().nullable().optional(),
  request_id: z.string().uuid(),
  config: configSchema,
}).strict().superRefine((value, ctx) => {
  if (value.source_reference_id === "MERGE-EYE-001" && value.config.scale !== "fine") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["config", "scale"], message: "Eyewear requires FINE mosaic" });
  }
});

export type DraftInput = z.infer<typeof createDraftSchema>;
export type DesignDraft = {
  draft_id: string;
  root_reference_id: string;
  source_reference_id: string;
  parent_draft_id: string | null;
  name: string;
  config: z.infer<typeof configSchema>;
  status: "CONCEPT";
  core_product_id: null;
  core_house_id: null;
  generation_status: "NOT_YET_IMPLEMENTED";
  created_at: string;
};

// A saved experience draft cannot become a CORE product through a response.
export const designDraftSchema = z.object({
  draft_id: z.string().uuid(),
  root_reference_id: z.enum(["MERGE-EYE-001", "MERGE-CASE-001"]),
  source_reference_id: z.enum(["MERGE-EYE-001", "MERGE-CASE-001"]),
  parent_draft_id: z.string().uuid().nullable(),
  name: z.string().trim().min(1).max(60),
  config: configSchema,
  status: z.literal("CONCEPT"),
  core_product_id: z.null(),
  core_house_id: z.null(),
  generation_status: z.literal("NOT_YET_IMPLEMENTED"),
  created_at: z.string().datetime({ offset: true }),
}).strict().superRefine((draft, ctx) => {
  if (draft.root_reference_id !== draft.source_reference_id ||
      (draft.source_reference_id === "MERGE-EYE-001" && draft.config.scale !== "fine") ||
      draft.parent_draft_id === draft.draft_id) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid experience draft lineage" });
  }
});

export function draftName(input: DraftInput) {
  const source = catalog.find((item) => item.product_id === input.source_reference_id)!;
  return input.config.name || `${source.title} · ჩემი ვერსია`;
}

export function canonicalDraftPayload(input: DraftInput) {
  return JSON.stringify({ source: input.source_reference_id, parent: input.parent_draft_id ?? null, config: input.config });
}

export const featureStatuses = [
  { name: "Private House scene versions", status: "IMPLEMENTED", detail: "Owner-scoped private scene snapshots with restore, branching and idempotent saves; not CORE House publication" },
  { name: "Commercial Policy Engine", status: "CALCULATION ONLY", detail: "Versioned integer estimates and immutable policy snapshots; no payable offer or payment movement" },
  { name: "მუზეუმი · ნივთის არჩევა", status: "WORKING", detail: "ისრები, კლავიატურა და მოზაიკის დეტალის ნახვა" },
  { name: "ჩემი კოლექცია", status: "WORKING", detail: "პირადი დიზაინის მონახაზები ინახება სერვერზე" },
  { name: "პირადი წვდომა", status: "CONNECTED", detail: "ChatGPT ანგარიშით დაცული სივრცე" },
  { name: "მასალის ტონის ჩვენება", status: "SIMULATED", detail: "სურათის ფერის ილუსტრაცია; არ ქმნის ახალ 3D მოდელს" },
  { name: "მუზეუმის ვიზუალური ექსპონატები", status: "PLACEHOLDER", detail: "არსებული კონცეფციები შენარჩუნებულია; მათი CORE ჩანაწერებთან ზუსტი კავშირი ჯერ დასადასტურებელია" },
  { name: "MERGE CORE", status: "READ INTERFACES READY", detail: "საჯარო კოლექციები და ფასები მოთხოვნისას იკითხება; ხელმისაწვდომობა თითოეულ პასუხზე მოწმდება. საერთო ავტორიზაცია და სრული გზა ჯერ დაუკავშირებელია" },
  { name: "Fit to Me · Digital Twin", status: "NOT YET IMPLEMENTED", detail: "პირადი მორგება მოითხოვს თანხმობას, Fit Profile-ს და რეალურ მორგების სერვისს" },
  { name: "AI · Meshy · 3D", status: "NOT YET IMPLEMENTED", detail: "მოდელის გენერაცია არ სრულდება; ახალი 3D ფაილი არ არსებობს" },
  { name: "Verified Offer · შეკვეთა", status: "NOT YET IMPLEMENTED", detail: "აქტიურდება მხოლოდ CORE-ის კონკრეტული ვერსიის დადასტურების შემდეგ" },
  { name: "გადახდა · წარმოება · QC", status: "NOT YET IMPLEMENTED", detail: "დადასტურება და ავტორიზაცია მხოლოდ CORE-ს ეკუთვნის" },
  { name: "Passport · QR · Brand House", status: "NOT YET IMPLEMENTED", detail: "ვერიფიცირებული ისტორია, უფლებები და იდენტობა CORE-დან უნდა მოვიდეს" },
] as const;
