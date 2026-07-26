import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/AdminLayout'
import { adminAiApi, type AiTrainingItem } from '@/features/ai/adminAi.api'

export default function AdminAiTrainingPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'pending' | 'knowledge'>('pending')
  const [selected, setSelected] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')

  const { data: pending = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-ai-pending'],
    queryFn: () => adminAiApi.listPending().then((r) => r.data.data),
  })

  const { data: knowledge = [], isLoading: knowledgeLoading } = useQuery({
    queryKey: ['admin-ai-knowledge'],
    queryFn: () => adminAiApi.listKnowledge().then((r) => r.data.data),
  })

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['admin-ai-pending'] })
    void qc.invalidateQueries({ queryKey: ['admin-ai-knowledge'] })
  }

  const teach = useMutation({
    mutationFn: ({ id, answer }: { id: string; answer: string }) => adminAiApi.teach(id, answer),
    onSuccess: () => {
      setSelected(null)
      setAnswer('')
      invalidate()
      setTab('knowledge')
    },
  })

  const dismiss = useMutation({
    mutationFn: (id: string) => adminAiApi.dismiss(id),
    onSuccess: () => {
      setSelected(null)
      setAnswer('')
      invalidate()
    },
  })

  const create = useMutation({
    mutationFn: () => adminAiApi.createKnowledge(newQ, newA),
    onSuccess: () => {
      setNewQ('')
      setNewA('')
      invalidate()
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => adminAiApi.removeKnowledge(id),
    onSuccess: invalidate,
  })

  const selectedItem = useMemo(
    () => pending.find((p) => p.id === selected) ?? null,
    [pending, selected],
  )

  const openTeach = (item: AiTrainingItem) => {
    setSelected(item.id)
    setAnswer(item.answer ?? '')
    setTab('pending')
  }

  return (
    <AdminLayout
      title={t('admin.aiTraining.title', { defaultValue: 'AI Training' })}
      subtitle={t('admin.aiTraining.subtitle', {
        defaultValue: 'Unknown user questions and trained answers',
      })}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {[
          {
            label: t('admin.aiTraining.pendingCount', { defaultValue: 'PENDING QUESTIONS' }),
            value: pending.length,
            color: '#f59e0b',
          },
          {
            label: t('admin.aiTraining.trainedCount', { defaultValue: 'TRAINED ANSWERS' }),
            value: knowledge.length,
            color: '#22c55e',
          },
        ].map((s) => (
          <div key={s.label} className="gold-card" style={{ padding: '18px 20px', borderRadius: '4px' }}>
            <p
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: '8px',
              }}
            >
              {s.label}
            </p>
            <p style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['pending', 'knowledge'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={tab === key ? 'gold-btn' : 'luxury-btn-ghost'}
            style={{ borderRadius: '4px', fontSize: '12px' }}
          >
            {key === 'pending'
              ? t('admin.aiTraining.tabPending', { defaultValue: 'Pending questions' })
              : t('admin.aiTraining.tabKnowledge', { defaultValue: 'Knowledge base' })}
          </button>
        ))}
      </div>

      {tab === 'pending' ? (
        <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 380px' : '1fr', gap: '20px' }}>
          <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c' }}>
                {t('admin.aiTraining.queueTitle', { defaultValue: 'QUESTIONS NEEDING ANSWERS' })}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {pendingLoading ? (
                <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>{t('common.loading')}</p>
              ) : pending.length === 0 ? (
                <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>
                  {t('admin.aiTraining.emptyPending', {
                    defaultValue: 'No unanswered questions right now.',
                  })}
                </p>
              ) : (
                pending.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openTeach(item)}
                    style={{
                      textAlign: 'left',
                      padding: '16px 20px',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      background:
                        selected === item.id ? 'rgba(201,168,76,0.08)' : 'transparent',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.45 }}>{item.question}</p>
                    <p
                      style={{
                        margin: '8px 0 0',
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {item.language?.toUpperCase() ?? '—'} · asked {item.askCount}× ·{' '}
                      {new Date(item.updatedAt).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedItem && (
            <div className="gold-card" style={{ borderRadius: '4px', padding: '20px' }}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#c9a84c',
                  marginBottom: '12px',
                }}
              >
                {t('admin.aiTraining.teachTitle', { defaultValue: 'TEACH ANSWER' })}
              </p>
              <p style={{ fontSize: '14px', color: '#fff', marginBottom: '14px', lineHeight: 1.5 }}>
                {selectedItem.question}
              </p>
              <label
                style={{
                  display: 'block',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.45)',
                  marginBottom: '8px',
                }}
              >
                {t('admin.aiTraining.answerLabel', { defaultValue: 'ANSWER' })}
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={8}
                placeholder={t('admin.aiTraining.answerPlaceholder', {
                  defaultValue: 'Write the answer the assistant should give for this question…',
                })}
                style={{
                  width: '100%',
                  background: '#0a0a0a',
                  border: '1px solid rgba(201,168,76,0.25)',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '4px',
                  resize: 'vertical',
                  marginBottom: '14px',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="gold-btn"
                  disabled={!answer.trim() || teach.isPending}
                  onClick={() => teach.mutate({ id: selectedItem.id, answer })}
                >
                  {teach.isPending
                    ? '…'
                    : t('admin.aiTraining.saveTeach', { defaultValue: 'Save & train' })}
                </button>
                <button
                  type="button"
                  className="luxury-btn-ghost"
                  disabled={dismiss.isPending}
                  onClick={() => dismiss.mutate(selectedItem.id)}
                >
                  {t('admin.aiTraining.dismiss', { defaultValue: 'Dismiss' })}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div className="gold-card" style={{ borderRadius: '4px', padding: '20px' }}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#c9a84c',
                marginBottom: '14px',
              }}
            >
              {t('admin.aiTraining.addTitle', { defaultValue: 'ADD KNOWLEDGE' })}
            </p>
            <input
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              placeholder={t('admin.aiTraining.questionPlaceholder', {
                defaultValue: 'Question',
              })}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid rgba(201,168,76,0.25)',
                color: '#fff',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '10px',
              }}
            />
            <textarea
              value={newA}
              onChange={(e) => setNewA(e.target.value)}
              rows={4}
              placeholder={t('admin.aiTraining.answerPlaceholder', {
                defaultValue: 'Answer',
              })}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid rgba(201,168,76,0.25)',
                color: '#fff',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            />
            <button
              type="button"
              className="gold-btn"
              disabled={!newQ.trim() || !newA.trim() || create.isPending}
              onClick={() => create.mutate()}
            >
              {create.isPending
                ? '…'
                : t('admin.aiTraining.addButton', { defaultValue: 'Add to knowledge' })}
            </button>
          </div>

          <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c' }}>
                {t('admin.aiTraining.knowledgeTitle', { defaultValue: 'TRAINED KNOWLEDGE' })}
              </p>
            </div>
            {knowledgeLoading ? (
              <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>{t('common.loading')}</p>
            ) : knowledge.length === 0 ? (
              <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>
                {t('admin.aiTraining.emptyKnowledge', {
                  defaultValue: 'No trained answers yet. Teach pending questions or add knowledge manually.',
                })}
              </p>
            ) : (
              knowledge.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p style={{ margin: 0, color: '#fff', fontWeight: 600 }}>{item.question}</p>
                  <p
                    style={{
                      margin: '8px 0 12px',
                      color: 'rgba(255,255,255,0.55)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {item.answer}
                  </p>
                  <button
                    type="button"
                    className="luxury-btn-ghost"
                    style={{ fontSize: '11px' }}
                    disabled={remove.isPending}
                    onClick={() => {
                      if (confirm(t('admin.aiTraining.confirmDelete', { defaultValue: 'Delete this answer?' }))) {
                        remove.mutate(item.id)
                      }
                    }}
                  >
                    {t('admin.aiTraining.delete', { defaultValue: 'Delete' })}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
