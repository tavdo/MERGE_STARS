import {z} from 'zod';
import {ascensionIds} from './ascension-exhibits';
import {museumStudy} from './museum-studies';
export const managerRoles=['concierge','brand','marketing','design','support','vision'] as const;
export const managerRequestSchema=z.object({
 request_id:z.string().uuid(),role:z.enum(managerRoles),message:z.string().trim().min(1).max(4000),
 brief:z.object({brand_name:z.string().max(100),description:z.string().max(2000)}).strict().optional(),
 history:z.array(z.object({role:z.enum(['user','assistant']),content:z.string().min(1).max(5000)}).strict()).max(8).default([]),
 image:z.string().max(1400000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/).optional(),
 exhibit_id:z.enum(ascensionIds).optional(),
 study_id:z.string().max(90).refine(id=>!!museumStudy(id),'UNKNOWN_STUDY').optional(),
 consent:z.literal(true),
}).strict().superRefine((value,ctx)=>{if(value.image&&value.role!=='vision')ctx.addIssue({code:'custom',message:'Images require the vision role',path:['image']});if(value.history.reduce((n,m)=>n+m.content.length,0)>20000)ctx.addIssue({code:'custom',message:'Conversation is too long',path:['history']});});
export type ManagerRequest=z.infer<typeof managerRequestSchema>;
export const managerResponseSchema=z.object({request_id:z.string().uuid(),reply:z.string().min(1).max(16000),provider:z.enum(['openai','anthropic','gemini']),role:z.enum(managerRoles),status:z.literal('ANSWERED'),external_action_executed:z.literal(false),core_record_created:z.literal(false)}).strict();
export const managerAvailabilitySchema=z.object({roles:z.array(z.object({role:z.enum(managerRoles),available:z.boolean(),provider:z.enum(['openai','anthropic','gemini']).nullable()}).strict()).length(6),status:z.enum(['CONFIGURATION_REQUIRED','READY_TO_REQUEST']),source:z.literal('SERVER_CONFIGURATION')}).strict();
