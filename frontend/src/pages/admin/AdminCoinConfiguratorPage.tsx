import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import AdminLayout from '@/components/AdminLayout'
import { configuratorApi, type CoinPackageConfig } from '@/features/coin-configurator/api/configurator.api'

export default function AdminCoinConfiguratorPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [editing, setEditing] = useState<CoinPackageConfig | null>(null)

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['admin-coin-package-configs'],
    queryFn: () => configuratorApi.adminPackageConfigs().then((r) => r.data.data),
  })

  const { data: pending = [] } = useQuery({
    queryKey: ['admin-configurator-pending'],
    queryFn: () => configuratorApi.adminPendingProducts().then((r) => r.data.data),
    refetchInterval: 30_000,
  })

  const saveConfig = useMutation({
    mutationFn: (body: { id: string; patch: Partial<CoinPackageConfig> }) =>
      configuratorApi.adminUpdatePackageConfig(body.id, body.patch).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coin-package-configs'] })
      setEditing(null)
    },
  })

  const verifyWeight = useMutation({
    mutationFn: (body: { productId: string; verifiedWeightG: number }) =>
      configuratorApi.adminVerifyWeight(body.productId, body.verifiedWeightG),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-configurator-pending'] })
    },
  })

  return (
    <AdminLayout
      title={t('admin.coinConfigurator.title', { defaultValue: 'Smart Coin Configurator' })}
      subtitle={t('admin.coinConfigurator.sub', {
        defaultValue: 'Package weights, CAD review queue, verified weights',
      })}
    >
      <div className="space-y-8">
        <section className="admin-section-card">
          <h3 className="admin-section-title">
            {t('admin.coinConfigurator.packages', { defaultValue: 'Coin package configs' })}
          </h3>
          <p className="text-sm text-neutral-400 mb-4">
            {t('admin.coinConfigurator.packagesHint', {
              defaultValue: 'Adjust case vs product capacity split (not hard-coded). Total = package kg × 1000 g.',
            })}
          </p>
          {isLoading ? (
            <p>Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table w-full text-sm">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>KG</th>
                    <th>Case (g)</th>
                    <th>Products (g)</th>
                    <th>Default</th>
                    <th>Active</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {configs.map((c) => (
                    <tr key={c.id}>
                      <td>{c.label}</td>
                      <td>{c.packageKg}</td>
                      <td>{c.caseWeightG}</td>
                      <td>{c.productCapacityG}</td>
                      <td>{c.isDefault ? '✓' : '—'}</td>
                      <td>{c.isActive ? '✓' : '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-link-btn"
                          onClick={() => setEditing(c)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {editing && (
          <section className="admin-section-card">
            <h3 className="admin-section-title">Edit {editing.label}</h3>
            <form
              className="grid md:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                saveConfig.mutate({
                  id: editing.id,
                  patch: {
                    label: String(fd.get('label') || editing.label),
                    caseWeightG: Number(fd.get('caseWeightG')),
                    productCapacityG: Number(fd.get('productCapacityG')),
                    isDefault: fd.get('isDefault') === 'on',
                    isActive: fd.get('isActive') === 'on',
                  },
                })
              }}
            >
              <label className="block">
                <span className="admin-field-label">Label</span>
                <input name="label" className="admin-input w-full" defaultValue={editing.label} />
              </label>
              <label className="block">
                <span className="admin-field-label">Case weight (g)</span>
                <input
                  name="caseWeightG"
                  type="number"
                  className="admin-input w-full"
                  defaultValue={editing.caseWeightG}
                />
              </label>
              <label className="block">
                <span className="admin-field-label">Product capacity (g)</span>
                <input
                  name="productCapacityG"
                  type="number"
                  className="admin-input w-full"
                  defaultValue={editing.productCapacityG}
                />
              </label>
              <label className="flex items-center gap-2">
                <input name="isDefault" type="checkbox" defaultChecked={editing.isDefault} />
                Default package
              </label>
              <label className="flex items-center gap-2">
                <input name="isActive" type="checkbox" defaultChecked={editing.isActive} />
                Active
              </label>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="admin-primary-btn" disabled={saveConfig.isPending}>
                  Save
                </button>
                <button type="button" className="admin-ghost-btn" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="admin-section-card">
          <h3 className="admin-section-title">
            {t('admin.coinConfigurator.cadQueue', { defaultValue: 'CAD / production review queue' })}
          </h3>
          {pending.length === 0 ? (
            <p className="text-neutral-500">No products pending verification.</p>
          ) : (
            <ul className="space-y-4">
              {pending.map((p) => (
                <li key={p.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex flex-wrap justify-between gap-2 mb-3">
                    <div>
                      <strong>{p.title}</strong>
                      <span className="text-neutral-400 ml-2">est. {p.estimatedWeightG} g</span>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-[#c9a84c]">{p.status}</span>
                  </div>
                  <form
                    className="flex flex-wrap items-end gap-3"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const w = Number(new FormData(e.currentTarget).get('weight'))
                      if (w > 0) verifyWeight.mutate({ productId: p.id, verifiedWeightG: w })
                    }}
                  >
                    <label>
                      <span className="admin-field-label">Verified weight (g)</span>
                      <input
                        name="weight"
                        type="number"
                        className="admin-input"
                        defaultValue={p.estimatedWeightG ?? undefined}
                        min={1}
                        required
                      />
                    </label>
                    <button type="submit" className="admin-primary-btn" disabled={verifyWeight.isPending}>
                      Verify weight
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
