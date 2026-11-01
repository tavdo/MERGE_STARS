import {z} from 'zod';
import {houseLayoutSchema} from './world-layout';

// Experience records only: never an owner identity, CORE House or public exhibit.
export const houseSceneInputSchema=z.object({
  request_id:z.string().uuid(),parent_version_id:z.string().uuid().nullable(),layout:houseLayoutSchema,
}).strict();
export const houseSceneVersionSchema=z.object({
  id:z.string().uuid(),parent_version_id:z.string().uuid().nullable(),layout:houseLayoutSchema,
  created_at:z.string().datetime({offset:true}),scope:z.literal('PRIVATE_SCENE_STUDY'),
  core_house_id:z.null(),publication_status:z.literal('PRIVATE'),
}).strict().refine(value=>value.id!==value.parent_version_id,'A scene cannot be its own parent');
export const houseSceneListSchema=z.object({versions:z.array(houseSceneVersionSchema).max(80)}).strict();
export const houseSceneSavedSchema=z.object({version:houseSceneVersionSchema,replayed:z.boolean()}).strict();
export type HouseSceneInput=z.infer<typeof houseSceneInputSchema>;
export type HouseSceneVersion=z.infer<typeof houseSceneVersionSchema>;
export function houseScenePayload(input:HouseSceneInput){return JSON.stringify({parent_version_id:input.parent_version_id,layout:input.layout});}
