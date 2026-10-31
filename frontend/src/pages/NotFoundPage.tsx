import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SiteLayout from '../components/SiteLayout'

export default function NotFoundPage() {
  const { t, i18n } = useTranslation()
  const georgian = i18n.language.startsWith('ka')
  return <SiteLayout><div className="page-hero"><p className="page-kicker">404</p><h1 className="page-title">{georgian ? 'გვერდი ვერ მოიძებნა' : 'Page not found'}</h1><p>{georgian ? 'ბმული გადაამოწმე ან მთავარ გვერდზე დაბრუნდი.' : 'Check the address or return to the home page.'}</p><Link to="/" className="gold-btn inline-flex mt-6">{t('nav.home')}</Link></div></SiteLayout>
}
