export type Row = Record<string, string | number | boolean | null | undefined>
export const label = (key: string) => key.replaceAll('_',' ').replace(/\bAg\b/,'Ag %').replace(/\bAu\b/,'Au %')
export interface LabState { batch: Row; production: Row[]; samples: Row[]; results: Row[]; files: Row[]; versions: Row[]; equipment: Row[]; passports: Row[]; products: Row[] }
export interface LabEvent { id: string; action: string; createdAt: string; actorId: string; payload: Row; revision: number; hash?: string }
export interface LabRecord { state: LabState; events: LabEvent[] }
export const positions = ['START','START-MIDDLE','MIDDLE','MIDDLE-END','END']
export const stages = [
 ['MERGE RAW MATERIAL','Polymer filament + separately identified precious metal.','Polymer filament','Recorded raw inputs','Precision scale'],
 ['GRANULATION','Granulate / shred the polymer filament into controlled feedstock.','Polymer filament','Polymer granules','Granulator / shredder'],
 ['CENTRIFUGAL FIBER FORMATION','First centrifugal melt formation. Conditions require polymer-specific trials.','Granules','Polymer microfibers','Centrifugal melt fiber machine'],
 ['COTTON-LIKE FIBER','Collect entangled polymer fibers in a controlled collector.','Microfibers','Loose cotton-like intermediate','Fiber collector'],
 ['PRECIOUS METAL INTEGRATION','Dose identified metal powder in an enclosed system. No open powder spraying.','Polymer fiber + metal powder','Controlled dosed feed','Closed powder dosing unit'],
 ['SECOND FIBER FORMATION','Second thermal / centrifugal re-spin is an R&D process hypothesis, not a validated recipe.','Dosed feed','Candidate composite fibers','Re-spin / thermal integration unit'],
 ['PRECIOUS-METAL FIBER','Collect the candidate composite mass; take representative samples.','Composite fibers','Composite fiber mass','Fiber collector + precision scale'],
 ['CARDING / ALIGNMENT','Card fibers and draw the sliver to improve alignment.','Loose fiber mass','Aligned sliver','Carding machine + draw frame'],
 ['ROVING / SPINNING','Drawing → roving → spinning → twisting; settings depend on fiber trials.','Aligned sliver','Twisted yarn','Roving + ring / compact spinning + twisting'],
 ['MERGE YARN','Wind and identify yarn; record output mass, losses and batch samples.','Twisted yarn','Identified yarn spool','Precision winder'],
 ['MOSAIC / TEXTILE','Weave, knit or connect a material study; allocate exact source batch weight.','Yarn + connectors','Textile / mosaic structure','Application-specific textile equipment'],
 ['FINISHED PRODUCT','Link to an existing CORE catalog product; retain its original ID.','Textile / structure','Finished product','Product assembly and QC'],
 ['PASSPORT / LEGACY','Reference assay, review, material passport, QR and product lineage preserve origin.','Batch + evidence + product','Traceable record','Laboratory + MERGE CORE'],
] as const
export const equipment = ['Filament Granulator / Shredder','Centrifugal Melt Fiber Machine','Closed Precious-Metal Powder Dosing System','Fiber Collector','Second Re-Spin / Thermal Integration Unit','Mini Carding Machine','Draw Frame','Roving Machine','Ring / Compact Spinning Machine','Twisting Machine','Precision Winder','Precision Scale','XRF Analyzer','Micro-XRF Analyzer','TGA Analyzer','External ICP-OES Laboratory']
export const methods = [
 {name:'XRF',kind:'ROUTINE QC',text:'Fast routine elemental screening. Calibration, sample geometry and matrix effects matter; a surface reading alone does not establish whole-batch uniformity.',url:'https://www.bruker.com/en/products-and-solutions/elemental-analyzers/micro-xrf-spectrometers.html'},
 {name:'MICRO-XRF',kind:'R&D MAPPING',text:'Elemental mapping of metal distribution around and within prepared fiber samples. Spatial maps complement quantitative assays.',url:'https://www.bruker.com/en/products-and-solutions/elemental-analyzers/eds-wds-ebsd-SEM-Micro-XRF/quantax-micro-xrf.html'},
 {name:'TGA',kind:'SUPPORTING ANALYSIS',text:'Thermal mass loss and inorganic residue support filler characterization. Residue is not a silver-specific or gold-specific assay.',url:'https://www.mt.com/dam/mt_ext_files/Editorial/Generic/0/TestingLabNews_5_files/testinglabsnews_5englishrevised.pdf'},
 {name:'ICP-OES',kind:'REFERENCE ASSAY',text:'Reference elemental concentration analysis after suitable sample preparation. Laboratory method validation, representativeness and uncertainty remain essential.',url:'https://www.agilent.com/cs/library/applications/application-usp661.1-5800-icp-oes-5994-4199en-agilent.pdf'},
]
export const colors = [['SILVER','#bcc1c5'],['GOLD','#caad66'],['BLACK','#36383a'],['RED','#b54b48'],['DEEP BLUE','#253f69'],['EMERALD','#28634d'],['BURGUNDY','#67283c'],['PEARL','#ded7c2'],['CUSTOM','#8a779b']]
export function demoRecord(): LabRecord {
 const state: LabState = { batch: {batch_id:'DEMO-MSY-2026-001',material_id:'DEMO-MAT-001',material_type:'Precious-metal composite yarn',polymer_type:'Unselected — R&D',polymer_input_kg:2,silver_input_kg:1,gold_input_kg:0,total_input_mass:3,total_output_mass:null,material_loss:null,target_metal_percentage:100/3,verified_metal_percentage:null,production_date:'Not recorded',operator:'DEMO operator',machine_id:'Not selected',process_version:'v0.1',sample_count:5,QC_status:'R&D',purity:'Not verified',closed_dosing:true,ventilation:'Required — not evidenced',PPE:'Required — not evidenced',operator_training:'Required — not evidenced',powder_batch_id:'DEMO-POWDER-001',particle_specification:'Not measured',safety_document:'Pending'},production:[],samples:positions.map((p,i)=>({sample_id:`DEMO-S0${i+1}`,batch_id:'DEMO-MSY-2026-001',sample_location:p,sample_weight:null})),results:[],files:[],versions:[{version:'v0.1',formula:'2 kg polymer + 1 kg Ag',polymer:'Not selected',metal_type:'Ag',particle_type:'Not specified',target_metal_percentage:100/3,process_sequence:'R&D sequence / 13 exhibits',machine_settings:'Pending trials',strength:'Not tested',flexibility:'Not tested',appearance:'Concept visualization',conductivity:'Not tested',test_results:'No real test data',notes:'DEMO reference formula; no production or verification claim.'}],equipment:[],passports:[{material_id:'DEMO-MAT-001',batch_id:'DEMO-MSY-2026-001',status:'DEMO TEMPLATE / NOT VERIFIED'}],products:[{product_id:'DEMO-TEXTILE-001',product_passport_id:'DEMO-PP-001',yarn_batch_id:'DEMO-YARN-001',material_batch_id:'DEMO-MSY-2026-001',title:'Mosaic textile study',yarn_weight_used_kg:0.12,calculated_precious_metal_kg:0.04,content_status:'CALCULATED / THEORETICAL',source_status:'R&D'}] }
 state.results.push({result_id:'DEMO-XRF-001',sample_id:'DEMO-S01',batch_id:'DEMO-MSY-2026-001',Ag:33.18,Au:0,other_elements:'Synthetic example only',test_method:'XRF',laboratory:'DEMO — no real laboratory',test_date:'2026-10-04',certificate:'None — synthetic DEMO result',result_status:'DEMO / NOT VERIFIED'});
 return { state,events:[{id:'DEMO-EVENT-001',action:'BATCH_CREATED',createdAt:'2026-10-04T00:00:00Z',actorId:'DEMO',payload:{batch_id:state.batch.batch_id},revision:1},{id:'DEMO-EVENT-002',action:'LAB_RESULT_ADDED',createdAt:'2026-10-04T00:00:01Z',actorId:'DEMO',payload:state.results[0],revision:2}] }
}
export function loadDemo(): LabRecord { try { const r = JSON.parse(localStorage.getItem('merge.material-lab.demo.v1') || 'null'); if(r?.state?.batch?.batch_id?.startsWith('DEMO-') && Array.isArray(r.events)) return r } catch { /* Use the isolated seed. */ } return demoRecord() }
export const commandTemplates: Record<string, Row> = {
 BATCH_CREATED:{polymer_input_kg:2,silver_input_kg:1,gold_input_kg:0,polymer_type:'',production_date:'2026-10-04',operator:'',machine_id:'',process_version:'v0.1',closed_dosing:true,ventilation:'',PPE:'',operator_training:'',powder_batch_id:'',particle_specification:'',safety_document:'',purity:'Not verified'},
 PRODUCTION_RECORDED:{step:'',input_material:'',output_material:'',parameters:'',machine_id:'',operator:'',date:'2026-10-04',total_output_mass:0,QC_status:'TESTING',photos_video:'',test_result:''},
 SAMPLE_ADDED:{sample_id:'',sample_location:'START',sample_weight:0.01},
 LAB_RESULT_ADDED:{result_id:'',sample_id:'',test_method:'XRF',Ag:0,Au:0,other_elements:'',laboratory:'',test_date:'2026-10-04',certificate:'',result_status:'TESTING'},
 LAB_RESULT_UPDATED:{result_id:'',supersedes:'',sample_id:'',test_method:'XRF',Ag:0,Au:0,other_elements:'',laboratory:'',test_date:'2026-10-04',certificate:'',result_status:'TESTING'},
 BATCH_VERIFIED:{result_id:'',verified_metal_percentage:0,review_notes:''},BATCH_REJECTED:{reason:''},PASSPORT_CREATED:{},
 PRODUCT_LINKED_TO_BATCH:{product_id:'',product_passport_id:'',yarn_batch_id:'',yarn_weight_used_kg:0.01},
 VERSION_ADDED:{version:'v0.2',formula:'',polymer:'',metal_type:'Ag',particle_type:'',target_metal_percentage:33.33,process_sequence:'',machine_settings:'',test_results:'',strength:'Not tested',flexibility:'Not tested',appearance:'',conductivity:'Not tested',notes:''},
 EQUIPMENT_ADDED:{equipment_id:'',name:'',manufacturer:'',model:'',purpose:'',status:'PROPOSED',capacity:'',supported_materials:'',photo:'',manual:'',maintenance_date:'',calibration_date:'',operator_permissions:''},
}
