"use client";
import {useState} from 'react';
import {ArrowRight,Expand} from 'lucide-react';
import {storyboardStages,storyboardCrop,photosForContext,type StoryboardStage,type PhotoContext} from '@/museum-v78/lib/photo-scenario';
import {museumPresentationAsset} from '@/museum-v78/lib/museum-assets';
import type {CityHouseId} from '@/museum-v78/lib/megapolis-domain';

export function StoryboardArtwork({stage}:{stage:StoryboardStage}){
 const [x,y,width,height]=storyboardCrop(stage);
 return <div className="storyboard-artwork" data-storyboard-panel={stage.id} style={{aspectRatio:width+' / '+height}}><img src={museumPresentationAsset(stage.image)} alt="" loading="lazy" style={{width:1448/width*100+'%',height:1086/height*100+'%',left:-x/width*100+'%',top:-y/height*100+'%'}}/></div>;
}
export function FounderStoryboard({group,disabled=false,onStage}:{group:'atelier'|'brand';disabled?:boolean;onStage:(id:number)=>void}){
 return <section className="founder-storyboard" aria-label={group==='atelier'?'Studio and Lab · stages 19–24':'My Brand House · stages 31–36'}><header><span className="eyebrow">{group==='atelier'?'STUDIO / LAB · 19–24':'MY BRAND HOUSE · 31–36'}</span><h3>{group==='atelier'?'Choose your creative studio.':'Your brand, connected.'}</h3></header><div className="storyboard-steps">{storyboardStages.filter(stage=>stage.group===group).map(stage=><button type="button" key={stage.id} disabled={disabled} data-storyboard-step={stage.id} onClick={()=>onStage(stage.id)}><StoryboardArtwork stage={stage}/><span><b>{stage.id}</b><strong>{stage.title}</strong><ArrowRight size={17}/></span></button>)}</div><p className="fine-note">Original storyboard panels open the existing workspace. Figures and verification badges inside the reference image are illustrative.</p></section>;
}
export function ContextPhotoSequence({context,houseId,disabled=false,onOriginal,primary=false}:{primary?:boolean;context:PhotoContext;houseId?:CityHouseId;disabled?:boolean;onOriginal?:(image:string)=>void}){
 const photos=photosForContext(context,houseId),[chosen,setChosen]=useState(0),photo=photos[Math.min(chosen,photos.length-1)];
 if(!photo)return null;
 return <section className="context-photo-sequence" data-photo-context={context} aria-label={context+' approved photographs'}><details open={primary}><summary>Original {context==='ai'?'MERGE AI':context==='brand'?'Brand House':context} photographs · {photos.length}</summary><nav aria-label="Choose a contextual photograph">{photos.map((item,index)=><button type="button" key={item.image} disabled={disabled} aria-pressed={index===chosen} onClick={()=>setChosen(index)}><img src={museumPresentationAsset(item.image)} alt="" loading="lazy"/><span>{item.title}</span></button>)}</nav><figure><img src={museumPresentationAsset(photo.image)} alt={photo.alt} loading="lazy"/><figcaption>{photo.title}{onOriginal?<button type="button" className="text-link" disabled={disabled} onClick={()=>onOriginal(photo.image)}><Expand size={15}/>Inspect original</button>:<a href={photo.image} target="_blank" rel="noreferrer">Inspect original</a>}</figcaption></figure></details></section>;
}
