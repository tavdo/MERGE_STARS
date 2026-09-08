import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BrandIcon from '@/components/BrandIcon'
import { CATEGORY_ICONS, type CategoryIconKey } from '@/assets/brandIcons'
import { CATALOG_CATEGORIES, type CatalogCategory } from '@/shared/catalogCategories'

type Props = {
  active?: CatalogCategory | null
  /** Base path for category links, e.g. /brand-room */
  basePath?: string
  counts?: Partial<Record<CatalogCategory, number>>
  onSelect?: (key: CatalogCategory | null) => void
}

export default function CategoryExploreGrid({
  active = null,
  basePath = '/brand-room',
  counts,
  onSelect,
}: Props) {
  const { t } = useTranslation()

  const categories = CATALOG_CATEGORIES.filter((key) => {
    if (!counts) return true
    const count = counts[key] ?? 0
    // Hide empty categories, but keep the active filter visible so it can be cleared
    return count > 0 || key === active
  })

  return (
    <section className="cat-explore">
      <h2 className="cat-explore-heading">{t('landing.categoriesTitle')}</h2>
      <div className="cat-explore-grid">
        {categories.map((key, i) => {
          const selected = active === key
          const count = counts?.[key]
          const className = `cat-explore-card${selected ? ' cat-explore-card--active' : ''}${
            i === categories.length - 1 ? ' cat-explore-card--last' : ''
          }`

          if (onSelect) {
            return (
              <button
                key={key}
                type="button"
                className={className}
                onClick={() => onSelect(selected ? null : key)}
              >
                <BrandIcon src={CATEGORY_ICONS[key as CategoryIconKey]} className="cat-explore-icon" />
                <span className="cat-explore-label">{t(`landing.categories.${key}`)}</span>
                {typeof count === 'number' && count > 0 && (
                  <span className="cat-explore-count">{count}</span>
                )}
              </button>
            )
          }

          return (
            <Link
              key={key}
              to={`${basePath}?category=${encodeURIComponent(key)}`}
              className={className}
            >
              <BrandIcon src={CATEGORY_ICONS[key as CategoryIconKey]} className="cat-explore-icon" />
              <span className="cat-explore-label">{t(`landing.categories.${key}`)}</span>
              {typeof count === 'number' && count > 0 && (
                <span className="cat-explore-count">{count}</span>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
