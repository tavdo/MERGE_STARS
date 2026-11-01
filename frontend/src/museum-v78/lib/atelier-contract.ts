import { z } from 'zod';
import { museumDesignIntentSchema } from './coin-museum';
export const atelierInputSchema = z.object({ request_id: z.string().uuid(), intent: museumDesignIntentSchema }).strict();
export const atelierRecordSchema = z.object({
  id: z.string().uuid(), intent: museumDesignIntentSchema,
  created_at: z.string().datetime({ offset: true }),
  status: z.literal('CONCEPT'), generation_status: z.literal('DEPENDENCY_REQUIRED'),
  core_product_id: z.null(), core_house_id: z.null(),
}).strict();
export const atelierListSchema = z.object({ drafts: z.array(atelierRecordSchema).max(100) }).strict();
export const atelierSavedSchema = z.object({ draft: atelierRecordSchema, replayed: z.boolean() }).strict();
export type AtelierInput = z.infer<typeof atelierInputSchema>;
export type AtelierRecord = z.infer<typeof atelierRecordSchema>;
