import {z} from 'zod';
import {cityHouses} from './megapolis-domain';
import {visualStudySchema,museumStudy} from './museum-studies';

// In-progress UI memory only, scoped to the signed-in Museum component.
// It is not durable storage, a CORE registration, a public draft or financial evidence.
export const museumStudioMemorySchema=z.object({house_id:z.string().max(40),category:z.string().max(200),description:z.string().max(3000),coin_line:z.enum(['GOLD','SILVER']),material:z.object({base_filament:z.string().max(160),precious_metal:z.enum(['','gold','silver','both']),integration:z.enum(['','blend','mosaic','surface','separate_component','lab_recommendation']),intended_use:z.string().max(160),details:z.string().max(500)}).strict(),visual:visualStudySchema.nullable(),importing:z.boolean()}).strict().superRefine((v,ctx)=>{const h=cityHouses.find(h=>h.id===v.house_id);if(!h||v.category&&!(h.categories as readonly string[]).includes(v.category))ctx.addIssue({code:'custom',message:'HOUSE_CATEGORY_REQUIRED'});if(v.visual){const s=museumStudy(v.visual.reference_id);if(s?.houseId!==v.house_id||s?.category!==v.category)ctx.addIssue({code:'custom',message:'STUDY_CATEGORY_MISMATCH'});}});
export type MuseumStudioMemory=z.infer<typeof museumStudioMemorySchema>;
