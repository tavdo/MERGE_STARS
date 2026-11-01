"use client";
import {companyIdentity} from '@/museum-v78/lib/company-identity';
// Founder artwork remains unchanged. The architectural entrance landmark uses
// the canonical mark as a presentation overlay, never a generated replacement.
export function ApprovedMuseumPortal({onError}:{onError?:()=>void}){return <svg className="approved-museum-artwork approved-museum-portal" viewBox="0 0 1672 941" width="1672" height="941" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Founder-approved Aurum and Argentum Museum entrance interior"><image href="/museum-v78/assets/optimized/founder-aurum-argentum-portal.webp" width="1672" height="941" onError={onError}/><rect x="781" y="183" width="56" height="45" rx="10" fill="#11100c"/><image href={companyIdentity.mark} x="791" y="185" width="36" height="40"/></svg>;}
