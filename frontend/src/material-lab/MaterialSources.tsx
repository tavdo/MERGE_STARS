import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/axios'
import type { Row } from './data'

/** Optional extension to the existing CORE product card; it never changes product IDs. */
export default function MaterialSources({ productId }: {productId:string}) {
 const [sources,setSources]=useState<Row[]>([])
 useEffect(()=>{let active=true;api.get(`/material-lab/products/${encodeURIComponent(productId)}/sources`).then(r=>{if(active)setSources(r.data.data??r.data)}).catch(()=>{});return()=>{active=false}},[productId])
 if(!sources.length)return null
 return <details className="material-source-extension"><summary>Material origin / MERGE Yarn</summary>{sources.map((s,i)=><div key={i}><p>Source batch: {String(s.material_batch_id)} · {String(s.yarn_batch_id)}</p><p>Yarn used: {String(s.yarn_weight_used_kg)} kg</p><p>Source assay at allocation: {String(s.verified_metal_percentage_at_link)} wt% · current source: {String(s.current_source_status)}</p><p>Calculated metal: {String(s.calculated_precious_metal_kg)} kg</p><small>CALCULATED — not a finished-product laboratory assay.</small>{typeof s.passport_path==='string'&&<Link to={s.passport_path}>View source Material Passport ↗</Link>}</div>)}</details>
}
