import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'

function unflatten(flat: Record<string, unknown>): Record<string, unknown> {
  const root: Record<string, unknown> = {}
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split('.')
    let cur: Record<string, unknown> = root
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i]
      if (!(p in cur) || typeof cur[p] !== 'object' || cur[p] === null || Array.isArray(cur[p])) {
        cur[p] = {}
      }
      cur = cur[p] as Record<string, unknown>
    }
    cur[parts[parts.length - 1]] = value
  }
  return root
}

function toTs(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent)
  const padIn = '  '.repeat(indent + 1)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((v) => `${padIn}${JSON.stringify(v)},`).join('\n')
    return `[\n${items}\n${pad}]`
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const body = entries
      .map(([k, v]) => {
        const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k)
        return `${padIn}${key}: ${toTs(v, indent + 1)},`
      })
      .join('\n')
    return `{\n${body}\n${pad}}`
  }
  return JSON.stringify(value)
}

const STATUS_EN: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  sent_to_crystal: 'Sent to Crystal',
  approved: 'Approved',
  rejected: 'Rejected',
  funds_received: 'Funds Received',
  production_queue: 'Production Queue',
  in_production: 'In Production',
  quality_check: 'Quality Check',
  ready: 'Ready',
  delivered: 'Delivered',
}

const STATUS_BY_LANG: Record<string, Record<string, string>> = {
  en: STATUS_EN,
  ka: {
    submitted: 'გაგზავნილია',
    under_review: 'განხილვაშია',
    sent_to_crystal: 'გაგზავნილია Crystal-ში',
    approved: 'დამტკიცებულია',
    rejected: 'უარყოფილია',
    funds_received: 'თანხა მიღებულია',
    production_queue: 'წარმოების რიგში',
    in_production: 'წარმოებაშია',
    quality_check: 'ხარისხის კონტროლი',
    ready: 'მზადაა',
    delivered: 'მიწოდებულია',
  },
  ar: {
    submitted: 'تم الإرسال',
    under_review: 'قيد المراجعة',
    sent_to_crystal: 'أُرسل إلى Crystal',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
    funds_received: 'تم استلام الأموال',
    production_queue: 'طابور الإنتاج',
    in_production: 'قيد الإنتاج',
    quality_check: 'فحص الجودة',
    ready: 'جاهز',
    delivered: 'تم التسليم',
  },
  ru: {
    submitted: 'Отправлено',
    under_review: 'На рассмотрении',
    sent_to_crystal: 'Отправлено в Crystal',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    funds_received: 'Средства получены',
    production_queue: 'Очередь производства',
    in_production: 'В производстве',
    quality_check: 'Проверка качества',
    ready: 'Готово',
    delivered: 'Доставлено',
  },
  de: {
    submitted: 'Eingereicht',
    under_review: 'In Prüfung',
    sent_to_crystal: 'An Crystal gesendet',
    approved: 'Genehmigt',
    rejected: 'Abgelehnt',
    funds_received: 'Mittel eingegangen',
    production_queue: 'Produktionswarteschlange',
    in_production: 'In Produktion',
    quality_check: 'Qualitätsprüfung',
    ready: 'Bereit',
    delivered: 'Geliefert',
  },
  fr: {
    submitted: 'Soumis',
    under_review: 'En cours d\'examen',
    sent_to_crystal: 'Envoyé à Crystal',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    funds_received: 'Fonds reçus',
    production_queue: 'File de production',
    in_production: 'En production',
    quality_check: 'Contrôle qualité',
    ready: 'Prêt',
    delivered: 'Livré',
  },
  tr: {
    submitted: 'Gönderildi',
    under_review: 'İnceleniyor',
    sent_to_crystal: "Crystal'a gönderildi",
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    funds_received: 'Fon alındı',
    production_queue: 'Üretim kuyruğu',
    in_production: 'Üretimde',
    quality_check: 'Kalite kontrol',
    ready: 'Hazır',
    delivered: 'Teslim edildi',
  },
}

const DROPZONE_BY_LANG: Record<string, { dropHint: string; removeFile: string }> = {
  en: { dropHint: 'Click or drag file here', removeFile: 'Remove file' },
  ka: { dropHint: 'დააწკაპუნეთ ან ჩააგდეთ ფაილი', removeFile: 'ფაილის წაშლა' },
  ar: { dropHint: 'انقر أو اسحب الملف هنا', removeFile: 'إزالة الملف' },
  ru: { dropHint: 'Нажмите или перетащите файл сюда', removeFile: 'Удалить файл' },
  de: { dropHint: 'Klicken oder Datei hierher ziehen', removeFile: 'Datei entfernen' },
  fr: { dropHint: 'Cliquez ou déposez le fichier ici', removeFile: 'Supprimer le fichier' },
  tr: { dropHint: 'Tıklayın veya dosyayı buraya sürükleyin', removeFile: 'Dosyayı kaldır' },
}

const DELIVERY_BY_LANG: Record<string, Record<string, string>> = {
  en: { pending: 'Pending', processing: 'Processing', in_transit: 'In transit', delivered: 'Delivered' },
  ka: { pending: 'მოლოდინში', processing: 'მუშავდება', in_transit: 'გზაშია', delivered: 'მიწოდებულია' },
  ar: { pending: 'قيد الانتظار', processing: 'قيد المعالجة', in_transit: 'في الطريق', delivered: 'تم التسليم' },
  ru: { pending: 'Ожидание', processing: 'Обработка', in_transit: 'В пути', delivered: 'Доставлено' },
  de: { pending: 'Ausstehend', processing: 'In Bearbeitung', in_transit: 'Unterwegs', delivered: 'Geliefert' },
  fr: { pending: 'En attente', processing: 'En traitement', in_transit: 'En transit', delivered: 'Livré' },
  tr: { pending: 'Beklemede', processing: 'İşleniyor', in_transit: 'Yolda', delivered: 'Teslim edildi' },
}

const ADMIN_EXTRA_EN: Record<string, string> = {
  'admin.finance.subtitle': 'FINANCE PANEL',
  'admin.kyc.subtitle': 'KYC VERIFICATION',
  'admin.crystal.subtitle': 'CRYSTAL WORKFLOW',
  'admin.bankReview.subtitle': 'BANK REVIEW CENTER',
  'admin.production.subtitle': 'PRODUCTION MANAGEMENT',
  'admin.analytics.subtitle': 'ANALYTICS DASHBOARD',
  'admin.audit.subtitle': 'AUDIT LOG',
  'admin.applications.export': 'Export',
  'admin.applications.title': 'Applications',
}

const outDir = join(process.cwd(), 'src/i18n/locales/fills')
mkdirSync(outDir, { recursive: true })

for (const lang of ['ka', 'ar', 'ru', 'de', 'fr', 'tr', 'en']) {
  let flat: Record<string, unknown> = {}
  if (lang !== 'en') {
    flat = JSON.parse(readFileSync(`/tmp/i18n/translated-${lang}.json`, 'utf8'))
  } else {
    flat = { ...ADMIN_EXTRA_EN }
    for (const [k, v] of Object.entries(DELIVERY_BY_LANG.en)) {
      flat[`deliveryStatuses.${k}`] = v
    }
  }
  const nested = unflatten(flat)
  nested.applicationStatuses = STATUS_BY_LANG[lang]
  nested.deliveryStatuses = DELIVERY_BY_LANG[lang]
  nested.catalog = {
    ...(typeof nested.catalog === 'object' && nested.catalog ? nested.catalog : {}),
    ...DROPZONE_BY_LANG[lang],
  }

  const body = toTs(nested, 0)
  const content = `/** Auto-generated locale fill for ${lang}. Do not edit by hand — regenerate via scripts/generate-fills.ts */\nexport default ${body}\n`
  writeFileSync(join(outDir, `${lang}.ts`), content)
  console.log('wrote', lang, Object.keys(flat).length, 'flat keys + statuses')
}
