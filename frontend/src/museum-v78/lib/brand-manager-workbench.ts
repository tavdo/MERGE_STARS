import {z} from 'zod';
import {managerBriefSchema,type ManagerBriefInput} from './merge-ai-manager';
export const workKinds=['Strategy','Collection plan','Product caption','Video script','Campaign calendar','Production checklist','Growth review','AI response'] as const;
export const workItemSchema=z.object({local_id:z.string().uuid(),kind:z.enum(workKinds),title:z.string().min(1).max(160),body:z.string().min(1).max(16000),review:z.enum(['DRAFT','REVIEWED']),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().startsWith(v),'Invalid calendar date').optional()}).strict();
export type BrandWorkItem=z.infer<typeof workItemSchema>;
export const brandWorkspaceSchema=z.object({kind:z.literal('MERGE_PRIVATE_BRAND_WORKSPACE'),version:z.literal(1),brief:managerBriefSchema,items:z.array(workItemSchema).max(60)}).strict().refine(v=>new Set(v.items.map(i=>i.local_id)).size===v.items.length,'Duplicate local draft IDs');
const postTopics=['Introduce the brand','The design intention','A detail worth seeing','Material preference','The mosaic language','Your collection direction','The source story','Fit and proportions','Behind the brief','A creator question','The next version','Invite people to your showroom'];
export function prepareBrandWork(brief:ManagerBriefInput,kind:Exclude<BrandWorkItem['kind'],'AI response'>){
 const checked=managerBriefSchema.safeParse(brief);if(!checked.success)return null;const b=checked.data;
 const start=`${b.brand_name}\n${b.description}\n\nWORKING DRAFT · assembled from your brief, not an AI answer.\nLanguage preference: ${b.content_language}. Tone: ${b.tone}.\n\n`;
 const content:Record<Exclude<BrandWorkItem['kind'],'AI response'>,string>={
 'Strategy':`POSITIONING\n${b.brand_name}: ${b.description}\n\nDefine your intended audience, the need your designs address and three visible design principles.\n\nNEXT DECISIONS\n1. Choose one collection to develop first.\n2. Select authorized source designs.\n3. Prepare fit/material briefs.\n4. Review before publication.\n\nEvidence still needed: rights, real product IDs, manufacturing proof and approved commercial terms.`,
 'Collection plan':Array.from({length:12},(_,i)=>`Line ${String(i+1).padStart(2,'0')} · Design direction to define\nCategory: choose a Museum House\nSource / rights: pending\nProduct / Version / Order ID: unassigned\nNext action: create or import a private design brief`).join('\n\n'),
 'Product caption':`${b.brand_name} — a new design direction.\n\n${b.description}\n\nExplore the design story and share the details you would like to see next.\n\n[Choose an actual product, state CONCEPT or VERIFIED from CORE, and insert its authorized QR/product link before publishing.]`,
 'Video script':`0–3 seconds · Introduce ${b.brand_name}.\n3–10 seconds · Show one actual authorized design, slowly.\n10–20 seconds · Explain one visible design detail from this brief: ${b.description}\n20–25 seconds · Distinguish the concept preview from a manufactured product.\n25–30 seconds · Invite viewers to the approved product/Brand House link.\n\nRequired before recording: rights to visual/music, correct source attribution and real product status.`,
 'Campaign calendar':postTopics.map((v,i)=>`Post ${String(i+1).padStart(2,'0')} · ${v}\nChannel: choose from ${b.channels.join(', ')}\nStatus: private draft\nReview: source, product status, caption, media rights and QR target\nPublication: not scheduled with a provider`).join('\n\n'),
 'Production checklist':`SOURCE & RIGHTS\nOriginal exhibit and creator attribution\nPermission to create this version\n\nFIT & MATERIAL\nRequired CORE Fit Profile revision\nMeasurable geometry, units and approved material recipe\nCalculated weight and approved price snapshot\n\nCOMMERCIAL\nTechnical verification and verified offer\nReal CORE Order ID and verified settlement\n\nDELIVERY\nManufacturer assignment and production authorization\nQC/XRF evidence, product Passport and authoritative QR\n\nAll items require actual CORE evidence. This checklist authorizes nothing.`,
 'Growth review':`OBSERVATIONS TO COLLECT\nActual Brand visits, QR visits, product views and consented channel reports\nReal CORE orders, settled payments and AVAILABLE commissions\n\nQUESTIONS\nWhich source brought a real visitor?\nWhich product received a genuine inquiry?\nWhich design needs improvement?\n\nNEXT EXPERIMENT\nChoose one permitted channel, one actual design and one reviewed message. Record the result when it is supplied by the provider.\n\nViews, likes and registrations are not earnings. No figures are assumed.`,
 };
 return start+content[kind];
}
export function preparePostDrafts(brief:ManagerBriefInput):Omit<BrandWorkItem,'local_id'>[]|null{
 if(!managerBriefSchema.safeParse(brief).success)return null;
 return postTopics.map((topic,i)=>({kind:'Product caption',title:`${String(i+1).padStart(2,'0')} · ${topic}`,review:'DRAFT',body:`${brief.brand_name} · ${topic}\n\n${brief.description}\n\n[Add one specific, truthful detail about your chosen design.]\n[Insert its authorized product/QR link after review.]\n\nPRIVATE TEMPLATE · not AI-generated, posted or connected to a product record.`}));
}
export function calendarICS(items:readonly BrandWorkItem[]){
 const clean=(v:string)=>v.replaceAll('\\','\\\\').replaceAll('\r','').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
 const fold=(value:string)=>{const lines:string[]=[];let line='',length=0;for(const char of value){const n=new TextEncoder().encode(char).length;if(length+n>73){lines.push(line);line=' ';length=1;}line+=char;length+=n;}lines.push(line);return lines.join('\r\n');};
 const stamp=new Date().toISOString().replaceAll('-','').replaceAll(':','').replace(/\.\d+Z$/,'Z');
 const events=items.filter(i=>i.date).map(i=>['BEGIN:VEVENT','UID:'+i.local_id+'@private.merge.local','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+i.date!.replaceAll('-',''),'SUMMARY:'+clean('DRAFT · '+i.title),'DESCRIPTION:'+clean(i.body+'\nPrivate review reminder only. No social publication scheduled.'),'STATUS:TENTATIVE','END:VEVENT'].map(fold).join('\r\n'));
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MERGE STARS//Private Review Plan//EN','CALSCALE:GREGORIAN',...events,'END:VCALENDAR',''].join('\r\n');
}
