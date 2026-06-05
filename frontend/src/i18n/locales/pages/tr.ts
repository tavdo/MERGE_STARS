import enPages from './en'
import trLegal from './tr-legal'

const { faq, contact, howItWorks, authPanel, dashboardHome, admin, ...rest } = enPages

export default {
  ...rest,
  ...trLegal,
  authPanel: { ...authPanel, theNext: 'YENİ', eraOf: 'LÜKS', luxury: 'ÇAĞI', welcome: '★ MERGE STARS\'A HOŞ GELDİNİZ ★', loginTab: '★ GİRİŞ', registerTab: '★ HESAP OLUŞTUR', enterPlatform: 'PLATFORMa GİR', backToHome: '← ANA SAYFA' },
  faq: { ...faq, title: 'SIKÇA SORULAN', titleGold: 'SORULAR', stillHaveQuestions: 'Başka sorularınız var mı?', contactUs: 'İLETİŞİM →' },
  contact: { ...contact, messageSent: 'MESAJ GÖNDERİLDİ', sendButton: 'GÖNDER →' },
  howItWorks: { ...howItWorks, kicker: 'NASIL ÇALIŞIR', ctaButton: 'HESAP OLUŞTUR →' },
  dashboardHome: { ...dashboardHome, coinBalance: 'Merge coin bakiyesi', underReview: 'İnceleniyor' },
  admin: { ...admin, panel: 'YÖNETİM PANELİ', logout: 'ÇIKIŞ' },
  aiPage: {
    disclaimer: 'MERGE AI yalnızca operasyonel rehberlik sağlar. Finansal tavsiye vermez ve getiri garantisi sunmaz.',
    typing: 'Asistan yazıyor',
    suggested: [
      'MERGE COIN nedir?',
      'Sipariş süreci nasıl işler?',
      'QR Kimlik sistemi nedir?',
      'Banka finansmanı nasıl çalışır?',
      'Referans politikası nedir?',
      'Başvuru durumumu nasıl kontrol ederim?',
    ],
    responses: {
      default: 'Sorunuz için teşekkürler. MERGE STARS platformu, MERGE COIN, sipariş, KYC, QR Kimlik ve genel platform rehberliği hakkında yardımcı olabilirim. Not: Finansal tavsiye, yatırım önerisi veya getiri garantisi veremem.',
      mergeCoin: 'MERGE COIN, MERGE STARS platformundaki Ürün Referans Biriminiz ve Marka Kimliğinizdir. Gerçek altın, gümüş veya platin içeren değerli metal kompozitli (3D filament) fiziksel bir lüks üründür. Kripto para, token veya finansal enstrüman DEĞİLDİR. Her coin benzersiz bir QR kodu ve Dijital Pasaporta sahiptir.',
      ordering: 'Sipariş akışı: TASLAK → GÖNDERİLDİ → FATURA → ÖDEME veya BANKA ONAYI → ÜRETİM → KALİTE KONTROL → HAZIR → TESLİMAT → TAMAMLANDI. Üretim YALNIZCA ödemeniz onaylandıktan sonra (payment_status = PAID) veya banka finansmanı onaylandıktan sonra (bank_status = APPROVED) başlar.',
      qr: 'QR Kimlik, MERGE STARS\'taki dijital pasaport sisteminizdir. Marka QR, Core QR ve Referans QR kodlarını içerir. Her tarama atıf ve doğrulama için kaydedilir. QR kodlarınız kayıt kaydınıza ve üretim durumunuza bağlanır.',
      financing: 'Banka finansmanı MERGE STARS tarafından değil, ortağımız Crystal tarafından sağlanır. Onay kredi değerlendirmesine tabidir ve garanti edilmez. Tipik yapı: ~%20 peşinat, kalan 12–24 ay. Üretim yalnızca bank_status = APPROVED olduktan sonra başlar.',
      referral: 'MERGE STARS yalnızca tek seviyeli referans sistemi kullanır. Çok seviyeli (MLM) referanslar yasaktır. Referans atfı, birisi QR kodunuz veya bağlantınız üzerinden kaydolup nitelikli sipariş tamamladığında kaydedilir.',
      status: 'Başvuru durumunuzu panelde veya /status adresinde kontrol edin. Durum: Gönderildi → İnceleniyor → Crystal\'a İletildi → Onaylandı → Üretimde → Teslim Edildi. Her aşamada bildirim alırsınız.',
    },
  },
}
