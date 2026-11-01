"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import {museumPresentationAsset} from '@/museum-v78/lib/museum-assets';
import {houseVisualsFor,houseReferenceImages} from "@/museum-v78/lib/visual-routes";
import { cityHouses, type CityHouseId } from "@/museum-v78/lib/megapolis-domain";

export function HouseVisualSequence({ houseId,disabled=false }: { houseId: CityHouseId;disabled?:boolean }) {
  const house = cityHouses.find(item => item.id === houseId);
  const images = houseVisualsFor(houseId);
  const [index, setIndex] = useState(0),[failed,setFailed]=useState(false);
  useEffect(()=>{setIndex(0);setFailed(false);},[houseId]);
  const image = images[index % images.length];
  return <div className="house-visual-sequence" data-house-visual={houseId} data-presentation="APPROVED_PHOTO_REFERENCE">
    <div className="house-visual-frame" key={image}>
      <img src={museumPresentationAsset(image)} alt={`${house?.title ?? houseId} — ${houseReferenceImages[houseId]?"approved visual study":"shared museum architectural reference"}`} onLoad={()=>setFailed(false)} onError={()=>setFailed(true)} />
      <div className="house-visual-shimmer" aria-hidden="true" />
    </div>
    {failed&&<div className="house-visual-image-error" role="status">Reference image unavailable. Category showcases remain accessible.</div>}
    <div className="house-visual-copy">
      <span className="eyebrow">VISUAL REFERENCE · {String(index + 1).padStart(2, "0")} / {images.length}</span>
      <h3>{house?.title ?? houseId}</h3>
      <p>{houseReferenceImages[houseId]?"Founder-approved concept study.":"Shared museum architecture. A dedicated House image has not been supplied."}</p>
      <div className="house-visual-controls">
        <button disabled={disabled||images.length<2} aria-label="Previous reference image" title="Previous reference image" onClick={() => {setFailed(false);setIndex(value => (value - 1 + images.length) % images.length);}}><ArrowLeft size={15}/></button>
        <button disabled={disabled||images.length<2} aria-label="Next reference image" title="Next reference image" onClick={() => {setFailed(false);setIndex(value => (value + 1) % images.length);}}><ArrowRight size={15}/></button>
        <span><Info size={14}/> CONCEPT REFERENCE</span>
      </div>
    </div>
  </div>;
}
