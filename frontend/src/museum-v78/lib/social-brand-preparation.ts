import {z} from 'zod';

// Public presentation metadata only. No provider app, account connection,
// credential, permission, session, profile or social identity is created here.
export const socialChannels=Object.freeze([
  Object.freeze({id:'tiktok',name:'TikTok',url:'https://www.tiktok.com/'}),
  Object.freeze({id:'instagram',name:'Instagram',url:'https://www.instagram.com/'}),
  Object.freeze({id:'facebook',name:'Facebook',url:'https://www.facebook.com/'}),
  Object.freeze({id:'linkedin',name:'LinkedIn',url:'https://www.linkedin.com/'}),
  Object.freeze({id:'youtube',name:'YouTube',url:'https://www.youtube.com/'}),
  Object.freeze({id:'pinterest',name:'Pinterest',url:'https://www.pinterest.com/'}),
  Object.freeze({id:'x',name:'X',url:'https://x.com/'}),
] as const);
export type SocialChannel=typeof socialChannels[number]['id'];
export type RegistrationMode='SELF'|'AI_ASSISTED';
export const socialProfilePreparationSchema=z.object({
  brand_name:z.string().trim().min(2).max(100),
  description:z.string().trim().min(10).max(2000),
  channels:z.array(z.enum(['tiktok','instagram','facebook','linkedin','youtube','pinterest','x'])).min(1).max(7).refine(values=>new Set(values).size===values.length),
  registration_mode:z.enum(['SELF','AI_ASSISTED']),
}).strict();

// A deterministic, editable profile brief assembled from the user's text.
// It is not an LLM response, verified product copy or external publication.
export function prepareSocialProfile(input:unknown){
  const parsed=socialProfilePreparationSchema.safeParse(input);if(!parsed.success)return null;
  const value=parsed.data;
  const handle=value.brand_name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9._]/g,'').slice(0,30)||null;
  const channels=socialChannels.filter(channel=>value.channels.includes(channel.id));
  const bio=value.brand_name+' — '+value.description;
  const text=[
    'MERGE STARS · SOCIAL PROFILE WORKING BRIEF',
    'Brand: '+value.brand_name,
    'Bio assembled from your text: '+bio,
    'Suggested handle: '+(handle?'@'+handle+' · availability not checked':'choose a handle manually'),
    'Channels: '+channels.map(channel=>channel.name).join(', '),
    'Registration path: '+(value.registration_mode==='SELF'?'SELF REGISTRATION':'AI-ASSISTED REGISTRATION · integration required'),
    'Check for an existing account first. Choosing a mode does not create an account or grant MERGE AI access.',
    'Email, passwords, recovery and 2FA remain under your control. Complete required security steps on the official provider site.',
    'Use authorized brand assets. The official MERGE company logo remains unchanged.',
    'Catalog, products and QR attribution must use existing authorized CORE records. This brief creates no product, QR or rights.',
    'Checklist: profile text → authorized visuals → first post draft → user approval → supported official publication.',
    'PREPARATION ONLY. No account created or connected, no post published, and no AI session or automation started.',
  ].join('\n\n');
  return {bio,proposedHandle:handle,channels:channels.map(channel=>channel.id),text,status:'PREPARATION_ONLY',connectionVerified:false,accountCreated:false,published:false,financialRightsChanged:false} as const;
}
