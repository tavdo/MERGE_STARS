import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/DashboardLayout'
export default function PaymentPage() {
  const { i18n } = useTranslation()
  const ka = i18n.language.startsWith('ka')
  return <DashboardLayout titleKey="payment"><div className="max-w-xl space-y-5"><h1>{ka ? 'Brand House-ის შეთავაზება' : 'Brand House offer'}</h1><p>{ka ? 'გადახდისთვის საჭიროა დადასტურებული შეთავაზება: პროდუქტის მონაცემები, საფასო წონა, მოქმედი ფასის წყარო, წესის ვერსია და შესრულების პირობები.' : 'Payment requires a verified offer: product data, pricing weight, current price source, rule version and fulfillment terms.'}</p><p>{ka ? 'ძველი განაცხადის სავარაუდო ფასი საბოლოო შეთავაზებას არ წარმოადგენს. მოთხოვნა გამოგზავნე ტექნიკური შეფასებისთვის.' : 'An estimated legacy application price is not a final offer. Submit a request for technical review.'}</p><Link to="/apply" className="luxury-btn-glass">{ka ? 'მოთხოვნის გაგზავნა' : 'Submit a request'}</Link><Link to="/dashboard/orders" className="block">{ka ? 'არსებული შეკვეთები' : 'Existing orders'}</Link></div></DashboardLayout>
}
