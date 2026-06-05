import enPages from './en'
import deLegal from './de-legal'

const { faq, contact, howItWorks, authPanel, dashboardHome, admin, ...rest } = enPages

export default {
  ...rest,
  ...deLegal,
  authPanel: { ...authPanel, theNext: 'DIE NÄCHSTE', eraOf: 'ÄRA DES', luxury: 'LUXUS', welcome: '★ WILLKOMMEN BEI MERGE STARS ★', loginTab: '★ ANMELDEN', registerTab: '★ KONTO ERSTELLEN', enterPlatform: 'PLATTFORM BETRETEN', backToHome: '← STARTSEITE' },
  faq: { ...faq, title: 'HÄUFIG GESTELLTE', titleGold: 'FRAGEN', stillHaveQuestions: 'Noch Fragen?', contactUs: 'KONTAKT →' },
  contact: { ...contact, messageSent: 'NACHRICHT GESENDET', sendButton: 'SENDEN →' },
  howItWorks: { ...howItWorks, kicker: 'SO FUNKTIONIERT ES', ctaButton: 'KONTO ERSTELLEN →' },
  dashboardHome: { ...dashboardHome, coinBalance: 'Merge-Coin-Guthaben', underReview: 'In Prüfung' },
  admin: { ...admin, panel: 'ADMIN-PANEL', logout: 'ABMELDEN' },
  aiPage: {
    disclaimer: 'MERGE AI bietet nur operative Orientierung. Keine Finanzberatung und keine Renditegarantie.',
    typing: 'Assistent schreibt',
    suggested: [
      'Was ist MERGE COIN?',
      'Wie funktioniert der Bestellprozess?',
      'Was ist das QR-Identity-System?',
      'Wie funktioniert die Bankfinanzierung?',
      'Wie lautet die Empfehlungspolitik?',
      'Wie prüfe ich meinen Antragsstatus?',
    ],
    responses: {
      default: 'Danke für Ihre Frage. Ich kann Informationen zur MERGE STARS-Plattform, MERGE COIN, Bestellungen, KYC, QR Identity und allgemeiner Orientierung geben. Hinweis: Ich kann keine Finanzberatung, Anlageempfehlungen oder Renditegarantien geben.',
      mergeCoin: 'MERGE COIN ist Ihre Produktreferenzeinheit und Markenidentität auf der MERGE STARS-Plattform. Es ist ein physisches Luxusprodukt aus Edelmetallkomposit (3D-Filament mit Gold, Silber oder Platin). Es ist KEINE Kryptowährung, kein Token und kein Finanzinstrument. Jede Münze hat einen einzigartigen QR-Code und Digital Passport.',
      ordering: 'Bestellablauf: ENTWURF → EINGEREICHT → RECHNUNG → ZAHLUNG oder BANKGENEHMIGUNG → PRODUKTION → QC → BEREIT → GELIEFERT → ABGESCHLOSSEN. Die Produktion beginnt NUR nach Zahlungsbestätigung (payment_status = PAID) oder Bankfinanzierungsgenehmigung (bank_status = APPROVED).',
      qr: 'QR Identity ist Ihr digitales Passsystem auf MERGE STARS. Es umfasst Brand QR, Core QR und Referral QR. Jeder Scan wird für Zuordnung und Verifizierung protokolliert. Ihre QR-Codes verknüpfen mit Ihrem Register und Produktionsstatus.',
      financing: 'Bankfinanzierung wird von unserem Partner Crystal bereitgestellt, nicht von MERGE STARS. Die Genehmigung unterliegt einer Bonitätsprüfung und ist nicht garantiert. Typische Struktur: ~20 % Anzahlung, Rest über 12–24 Monate. Produktion startet erst nach bank_status = APPROVED.',
      referral: 'MERGE STARS nutzt nur ein einstufiges Empfehlungssystem. Mehrstufige (MLM-)Empfehlungen sind verboten. Die Zuordnung wird erfasst, wenn sich jemand über Ihren QR oder Link registriert und eine qualifizierende Bestellung abschließt.',
      status: 'Prüfen Sie Ihren Antragsstatus im Dashboard oder unter /status. Fortschritt: Eingereicht → In Prüfung → An Crystal gesendet → Genehmigt → In Produktion → Geliefert. Sie erhalten Benachrichtigungen in jeder Phase.',
    },
  },
}
