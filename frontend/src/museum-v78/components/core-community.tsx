"use client";
import { useId, useState } from 'react';
import { MessageCircle, MessageSquare, RefreshCw, Send } from 'lucide-react';
import { useCoreRead } from '@/museum-v78/components/core-context';
import { coreReadMessages } from '@/museum-v78/lib/core-read-state';

export type CommunityScope = { title: string; brandLineId?: string };

// This screen reads the existing fail-closed CORE boundary. No message store,
// anonymous identity, optimistic receipt, demo activity or write endpoint is added.
export function CoreCommunity({ scope }: { scope: CommunityScope }) {
  const [tab, setTab] = useState<'chat' | 'comments'>('chat');
  const { data, error, retry } = useCoreRead<unknown>(`/api/core/${tab}`);
  const field = useId();
  return <section className="core-community" aria-label="ჩატი და კომენტარები" data-core-source="MERGE_CORE">
    <p className="eyebrow">{scope.title}</p>
    <div className="core-community-tabs" aria-label="საუბრის ტიპი">
      <button aria-pressed={tab === 'chat'} onClick={() => setTab('chat')}><MessageCircle size={17}/>ჩატი</button>
      <button aria-pressed={tab === 'comments'} onClick={() => setTab('comments')}><MessageSquare size={17}/>კომენტარები</button>
    </div>
    <div className="core-community-status" role="status">
      <MessageCircle size={28}/>
      <strong>{error ? 'კავშირი ჯერ მიუწვდომელია' : data ? 'დაკავშირება შესამოწმებელია' : 'კავშირი მოწმდება…'}</strong>
      <p>{error ? coreReadMessages[error] : data ? 'საუბრის მოქმედი უფლებები და ჩანაწერები ჯერ არ დადასტურებულა.' : 'MERGE-ის პასუხის მოლოდინი.'}</p>
      <p>გაგზავნა და კომენტარების მიღება ჩაირთვება საერთო ანგარიშისა და საუბრის სერვისის დაკავშირების შემდეგ.</p>
      {error && <button className="text-link" onClick={retry}><RefreshCw size={15}/>ხელახლა შემოწმება</button>}
    </div>
    <label htmlFor={field}>{tab === 'chat' ? 'შეტყობინება' : 'კომენტარი'}</label>
    <textarea id={field} disabled placeholder="დაკავშირების მოლოდინი" rows={3}/>
    <button className="button outline" disabled><Send size={16}/>გაგზავნა ჯერ მიუწვდომელია</button>
    {scope.brandLineId && <p className="fine-note">საუბრის მიმართულება: {scope.title}. ავტორის CORE Brand Line ცნობილია; პირადი მიმოწერის უფლება ჯერ დასადასტურებელია.</p>}
  </section>;
}
