"use client";
import {MERGEAIManagerPage,type ManagerWorkspaceMemory} from '@/museum-v78/components/merge-ai-workspace';
import type {MutableRefObject} from 'react';
import {FounderVisualReferences} from './founder-visual-references';

// Existing Museum entry points keep the same callbacks and camera memory.
export function PersonalMergeAI(props:{initialSection?:string;onStage?:(id:number)=>void;onOriginal?:(image:string)=>void;signedIn:boolean;onIdentity:()=>void;onOrders:()=>void;memory?:MutableRefObject<ManagerWorkspaceMemory|null>}){
  return <><MERGEAIManagerPage {...props}/><details className="mai-reference-archive"><summary>Approved architectural reference</summary><FounderVisualReferences context="ai"/></details></>;
}
