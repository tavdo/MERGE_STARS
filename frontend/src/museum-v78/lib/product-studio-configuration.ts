import type {CityHouseId} from './megapolis-domain';
type Field={id:string;label:string;options?:readonly string[]};
const choice=(id:string,label:string,options:readonly string[]):Field=>({id,label,options});
const text=(id:string,label:string):Field=>({id,label});
const directions:Record<CityHouseId,Field[]>={
 watches:[choice('case','Case design',['Round','Square','Oval','Source geometry']),choice('dial','Dial style',['Minimal','Open architecture','Ornamental','Custom source']),choice('movement','Movement preference',['Original manufacturer component','Mechanical · verification required','Electronic · verification required','Technical team recommendation']),choice('strap','Strap / bracelet',['Articulated bracelet','Flexible strap','Modular cuff','Source design']),text('engraving','Engraving text')],
 jewelry:[choice('setting','Setting preference',['Source setting','Minimal','Sculptural','Custom']),text('stone','Gemstone preference · approval required'),text('engraving','Engraving text')],
 fashion:[choice('silhouette','Silhouette / shape',['Tailored','Relaxed','Sculptural','Classic','Custom source']),choice('pattern','Pattern',['Plain','Selective mosaic','Ornamental','Custom']),text('hardware','Buttons / hardware / details'),text('monogram','Your own monogram')],
 mosaic:[choice('application','Application',['Panel','Textile surface','Object detail','Architectural surface']),choice('layout','Layout',['Geometric','Organic','Source ornament','Custom']),text('mounting','Mounting preference')],
 games:[choice('format','Set format',['Single object','Complete set','Modular set','Custom']),text('pieces','Pieces / components'),text('audience','Intended age group and use')],
 music:[text('instrument','Instrument / component'),choice('scope','Manufacturing scope',['Decorative exterior','Approved MERGE component','Full concept · technical review']),text('acoustic','Acoustic / ergonomic requirements')],
 robotics:[text('function','Intended device / robot function'),choice('scope','MERGE component scope',['Housing','Decorative shell','Approved structural part','Concept only']),text('protected','Original electronics / protected components')],
 nature:[text('species','Tree / flower / natural form'),choice('setting','Setting',['Indoor','Outdoor','Architectural installation']),text('support','Support and installation requirements')],
 eyewear:[choice('frame','Frame geometry',['Round','Angular','Oval','Source geometry','Custom']),choice('lens','Lens preference',['Original manufacturer component','Prescription · specialist review','Decorative concept']),text('hinge','Hinge / temple details')],
 interior:[text('room','Room / installation context'),choice('style','Interior style',['Royal','Dark','Light','Minimal','Classic','Futuristic','Natural','Artistic','Custom']),text('function','Ergonomic / functional requirements')],
 art:[choice('form','Art form',['Sculpture','Relief','Installation','Panel','Custom']),text('source','Source / authorship notes'),text('mounting','Display and mounting')],
 mobility:[choice('scope','MERGE component scope',['Interior detail','Exterior finish','Approved accessory','Concept only']),text('source','Original manufacturer attribution'),text('protected','Protected technical components')],
};
export function productConfigurationFields(house:CityHouseId){return [...directions[house],choice('mosaic','Mosaic scale',['MICRO','FINE','MEDIUM','LARGE','ARCHITECTURAL']),text('palette','Color palette'),text('dimensions','Requested dimensions and units')];}
const start='[Configuration preferences]',end='[End configuration preferences]';
export function readProductConfiguration(house:CityHouseId,description:string){const block=description.split(start)[1]?.split(end)[0]??'';const values:Record<string,string>={};for(const field of productConfigurationFields(house)){const line=block.split('\n').find(v=>v.startsWith(field.label+': '));if(line){const value=line.slice(field.label.length+2);if(value.length<=200&&(!field.options||field.options.includes(value)))values[field.id]=value;}}return values;}
export function applyProductConfiguration(house:CityHouseId,description:string,values:Record<string,string>){
 const fields=productConfigurationFields(house);if(Object.keys(values).some(key=>!fields.some(f=>f.id===key)))return null;
 const lines:string[]=[];for(const f of fields){const v=values[f.id]?.trim();if(!v)continue;if(v.length>200||/[\r\n]/.test(v)||f.options&&!f.options.includes(v))return null;lines.push(f.label+': '+v);}
 if(!lines.length)return null;
 const original=description.replace(/\n?\[Configuration preferences\][\s\S]*?\[End configuration preferences\]/g,'').trim();
 const value=[original,start,...lines,'Design preferences only. Fit, materials, measured weight, rights and manufacturer approval remain unverified.',end].filter(Boolean).join('\n');return value.length<=3000?value:null;
}
