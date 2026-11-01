// Temporary, consent-based editing state. This is not another Fit Profile.
// Only a mapped, authenticated MERGE CORE response can supply a profile revision.
export type FitCategory='none'|'ring'|'wrist'|'fashion'|'shoes'|'eyewear';
export type BodyPresentation='woman'|'man';
export type MeasurementOrigin='USER_ENTERED'|'COMPUTED'|'CORE_VERIFIED';
export type MeasurementValue={value:number;unit:'cm'|'mm';origin:MeasurementOrigin};
export const measurementFields=[
 {id:'height',label:'სიმაღლე',unit:'cm',min:50,max:250,anchor:[0,1.94,0],help:'გაზომე ფეხშიშველმა, იატაკიდან თავის ზედა წერტილამდე.'},
 {id:'shoulders',label:'მხრების სიგანე',unit:'cm',min:10,max:100,anchor:[-.3,1.44,0],help:'გაზომე მარცხენა და მარჯვენა მხრის გარე წერტილებს შორის.'},
 {id:'chest',label:'გულმკერდი',unit:'cm',min:30,max:250,anchor:[.17,1.32,0],help:'ლენტი ჰორიზონტალურად გაატარე გულმკერდის ყველაზე ფართო ნაწილზე.'},
 {id:'waist',label:'წელის გარშემოწერილობა',unit:'cm',min:25,max:250,anchor:[-.14,1.08,0],help:'გაზომე ბუნებრივ წელზე; ლენტი სხეულს არ მოუჭირო.'},
 {id:'hips',label:'თეძოს გარშემოწერილობა',unit:'cm',min:30,max:250,anchor:[.19,.95,0],help:'გაზომე თეძოს ყველაზე ფართო ნაწილზე, ჰორიზონტალურად.'},
 {id:'neck',label:'კისრის გარშემოწერილობა',unit:'cm',min:15,max:80,anchor:[.07,1.54,0],help:'გაზომე კისრის ძირთან, ლენტის მოჭერის გარეშე.'},
 {id:'arm',label:'მკლავის სიგრძე',unit:'cm',min:15,max:130,anchor:[-.31,1.2,0],help:'მხრის წერტილიდან მაჯამდე; კონკრეტული მოდელის წესს CORE დააზუსტებს.'},
 {id:'leg',label:'ფეხის სიგრძე',unit:'cm',min:20,max:160,anchor:[.13,.63,0],help:'გაზომე შიდა სიგრძე საზარდულიდან იატაკამდე.'},
 {id:'wrist_left',label:'მარცხენა მაჯა',unit:'cm',min:5,max:45,anchor:[-.3,.87,0],help:'გაზომე იმ ადგილას, სადაც საათს ან სამაჯურს ატარებ.'},
 {id:'wrist_right',label:'მარჯვენა მაჯა',unit:'cm',min:5,max:45,anchor:[.3,.87,0],help:'გაზომე იმ ადგილას, სადაც საათს ან სამაჯურს ატარებ.'},
 {id:'foot_left_length',label:'მარცხენა ტერფის სიგრძე',unit:'mm',min:80,max:400,anchor:[-.13,.07,-.1],help:'დგომისას ქუსლიდან ყველაზე გრძელ თითამდე, მილიმეტრებში.'},
 {id:'foot_right_length',label:'მარჯვენა ტერფის სიგრძე',unit:'mm',min:80,max:400,anchor:[.13,.07,-.1],help:'გაზომე ცალკე: მარჯვენა და მარცხენა ტერფი შეიძლება განსხვავდებოდეს.'},
 {id:'foot_left_width',label:'მარცხენა ტერფის სიგანე',unit:'mm',min:30,max:180,anchor:[-.19,.12,0],help:'დგომისას გაზომე ტერფის ყველაზე ფართო ნაწილი.'},
 {id:'foot_right_width',label:'მარჯვენა ტერფის სიგანე',unit:'mm',min:30,max:180,anchor:[.19,.12,0],help:'დგომისას გაზომე ტერფის ყველაზე ფართო ნაწილი.'},
 {id:'head',label:'თავის გარშემოწერილობა',unit:'cm',min:30,max:80,anchor:[-.15,1.75,0],help:'ლენტი გაატარე წარბების ზემოთ და თავის უკანა ფართო ნაწილზე.'},
 {id:'frame_width',label:'სათვალის ჩარჩოს სიგანე',unit:'mm',min:60,max:200,anchor:[.14,1.76,-.1],help:'ზომა აიღე კარგად მორგებული ჩარჩოს ტექნიკური მონაცემიდან.'},
 {id:'bridge',label:'სათვალის ხიდი',unit:'mm',min:5,max:40,anchor:[0,1.72,-.15],help:'მიუთითე კარგად მორგებული ჩარჩოს ხიდის ზომა.'},
 {id:'temple',label:'სათვალის ტარის სიგრძე',unit:'mm',min:70,max:180,anchor:[.15,1.73,.08],help:'აიღე კარგად მორგებული ჩარჩოს ტექნიკური მონაცემიდან.'},
 {id:'pd',label:'გუგებს შორის მანძილი',unit:'mm',min:35,max:85,anchor:[0,1.77,-.15],help:'გამოიყენე სპეციალისტის გაზომვა. სახის ფოტო საჭირო არ არის.'},
] as const;
export type MeasurementId=typeof measurementFields[number]['id'];
export const fingers=['thumb','index','middle','ring','little'] as const;
export type Finger=typeof fingers[number];
export type Hand='left'|'right';
export type FingerId=`finger_${Hand}_${Finger}`;
export type BodyFieldId=MeasurementId|FingerId;
export type MeasurementDraft={consent:boolean;presentation:BodyPresentation;values:Partial<Record<BodyFieldId,MeasurementValue>>;hand:Hand;finger:Finger;shoeSystem:''|'EU'|'UK'|'US_W'|'US_M'|'CM';shoeSize:string};
export const emptyMeasurementDraft=():MeasurementDraft=>({consent:false,presentation:'woman',values:{},hand:'left',finger:'ring',shoeSystem:'',shoeSize:''});
export const selectedFinger=(draft:Pick<MeasurementDraft,'hand'|'finger'>):FingerId=>`finger_${draft.hand}_${draft.finger}`;
export function measurementSpec(id:BodyFieldId){
 if(/^finger_(left|right)_(thumb|index|middle|ring|little)$/.test(id))return {id,label:'არჩეული თითის გარშემოწერილობა',unit:'mm' as const,min:25,max:110,anchor:[0,.8,0] as const,help:'თითის გარშემოწერილობა მილიმეტრებში. ბეჭდის სისტემაში გარდაქმნა მწარმოებლის დამტკიცებულ ცხრილს მოითხოვს.'};
 return measurementFields.find(field=>field.id===id)??null;
}
export function userMeasurement(id:BodyFieldId,raw:string):MeasurementValue|null{
 const field=measurementSpec(id);if(!field||!raw.trim())return null;
 const value=Number(raw.replace(',','.'));
 if(!Number.isFinite(value)||value<field.min||value>field.max)throw new Error('MEASUREMENT_RANGE');
 return {value,unit:field.unit,origin:'USER_ENTERED'};
}
export function measured(draft:MeasurementDraft,id:BodyFieldId){const entry=draft.values[id],spec=measurementSpec(id);return draft.consent&&!!spec&&!!entry&&Number.isFinite(entry.value)&&entry.origin!=='COMPUTED'&&entry.unit===spec.unit&&entry.value>=spec.min&&entry.value<=spec.max;}
export function requiredMeasurements(category:FitCategory,draft:MeasurementDraft):BodyFieldId[]{
 switch(category){
  case 'ring':return [selectedFinger(draft)];
  case 'wrist':return [draft.hand==='left'?'wrist_left':'wrist_right'];
  case 'fashion':return ['height','shoulders','chest','waist','hips','arm','leg'];
  case 'shoes':return ['foot_left_length','foot_right_length','foot_left_width','foot_right_width'];
  case 'eyewear':return ['head','frame_width','bridge','temple','pd'];
  default:return [];
 }
}
export function fitReadiness(category:FitCategory,draft:MeasurementDraft){
 const missing=requiredMeasurements(category,draft).filter(id=>!measured(draft,id));
 const missingSystem=category==='shoes'&&!draft.shoeSystem;
 // A complete editing form is never an authoritative revision or an offer.
 return {missing,missingSystem,formComplete:category!=='none'&&draft.consent&&!missing.length&&!missingSystem,profileRevision:null,canFit:false,canOrder:false,status:category==='none'?'REQUIREMENTS_UNAVAILABLE':!draft.consent?'CONSENT_REQUIRED':missing.length||missingSystem?'MEASUREMENTS_REQUIRED':'CORE_PROFILE_REVISION_REQUIRED'} as const;
}
export type DisplayBodyShape={height:number;shoulders:number;chest:number;waist:number;hips:number;arm:number;leg:number;leftFoot:number;rightFoot:number;leftFootWidth:number;rightFootWidth:number;leftWrist:number;rightWrist:number;neck:number;head:number};
export function displayBodyShape(draft:MeasurementDraft):DisplayBodyShape{
 const ratio=(id:MeasurementId,base:number,min=.65,max=1.5)=>measured(draft,id)?Math.max(min,Math.min(max,draft.values[id]!.value/base)):1;
 return {height:ratio('height',194,.35,1.4),shoulders:ratio('shoulders',45),chest:ratio('chest',98),waist:ratio('waist',80),hips:ratio('hips',98),arm:ratio('arm',61,.65,1.35),leg:ratio('leg',90,.65,1.35),leftFoot:ratio('foot_left_length',260,.5,1.5),rightFoot:ratio('foot_right_length',260,.5,1.5),leftFootWidth:ratio('foot_left_width',100),rightFootWidth:ratio('foot_right_width',100),leftWrist:ratio('wrist_left',17),rightWrist:ratio('wrist_right',17),neck:ratio('neck',38),head:ratio('head',57)};
}
export const neutralBodyShape:DisplayBodyShape={height:1,shoulders:1,chest:1,waist:1,hips:1,arm:1,leg:1,leftFoot:1,rightFoot:1,leftFootWidth:1,rightFootWidth:1,leftWrist:1,rightWrist:1,neck:1,head:1};
