import { companyIdentity } from '@/museum-v78/lib/company-identity';

export function CompanyMark({ className = '', decorative = false }: { className?: string; decorative?: boolean }) {
  return <img className={'company-mark ' + className} src={companyIdentity.mark} alt={decorative ? '' : 'MERGE ⭐ STARS — კომპანიის ოფიციალური ლოგო'} width={204} height={202} decoding="async" />;
}

export function CompanyWordmark() {
  return <span className="company-wordmark"><CompanyMark decorative/><span><strong>MERGE <span>STARS</span></strong><small>THE JEWELER OF BRANDS</small></span></span>;
}
