import enPages from './en'
import frLegal from './fr-legal'

const { faq, contact, howItWorks, authPanel, dashboardHome, admin, ...rest } = enPages

export default {
  ...rest,
  ...frLegal,
  authPanel: { ...authPanel, theNext: 'LA PROCHAINE', eraOf: 'ÈRE DE', luxury: 'LUXE', welcome: '★ BIENVENUE SUR MERGE STARS ★', loginTab: '★ CONNEXION', registerTab: '★ CRÉER UN COMPTE', enterPlatform: 'ENTRER', backToHome: '← ACCUEIL' },
  faq: { ...faq, title: 'QUESTIONS', titleGold: 'FRÉQUENTES', stillHaveQuestions: 'Encore des questions ?', contactUs: 'NOUS CONTACTER →' },
  contact: { ...contact, title: 'NOUS', titleGold: 'CONTACTER', messageSent: 'MESSAGE ENVOYÉ', sendButton: 'ENVOYER →' },
  howItWorks: { ...howItWorks, kicker: 'COMMENT ÇA MARCHE', ctaButton: 'CRÉER UN COMPTE →' },
  dashboardHome: { ...dashboardHome, coinBalance: 'Solde Merge coin', underReview: 'En cours d\'examen' },
  admin: { ...admin, panel: 'PANNEAU ADMIN', logout: 'DÉCONNEXION' },
  aiPage: {
    disclaimer: 'MERGE AI fournit uniquement des conseils opérationnels. Il ne fournit pas de conseils financiers et ne garantit aucun rendement.',
    typing: 'L\'assistant écrit',
    suggested: [
      'Qu\'est-ce que MERGE COIN ?',
      'Comment fonctionne le processus de commande ?',
      'Qu\'est-ce que le système QR Identity ?',
      'Comment fonctionne le financement bancaire ?',
      'Quelle est la politique de parrainage ?',
      'Comment vérifier le statut de ma demande ?',
    ],
    responses: {
      default: 'Merci pour votre question. Je peux vous aider avec des informations sur la plateforme MERGE STARS, MERGE COIN, les commandes, le KYC, QR Identity et l\'orientation générale. Remarque : je ne peux pas fournir de conseils financiers, de recommandations d\'investissement ou garantir des rendements.',
      mergeCoin: 'MERGE COIN est votre unité de référence produit et identité de marque sur la plateforme MERGE STARS. C\'est un produit de luxe physique en composite de métaux précieux (filament 3D avec or, argent ou platine). Ce n\'est PAS une cryptomonnaie, un token ou un instrument financier. Chaque pièce a un QR code unique et un passeport numérique.',
      ordering: 'Le flux de commande : BROUILLON → SOUMIS → FACTURE → PAIEMENT ou APPROBATION BANCAIRE → PRODUCTION → QC → PRÊT → LIVRÉ → TERMINÉ. La production commence UNIQUEMENT après confirmation du paiement (payment_status = PAID) ou approbation du financement bancaire (bank_status = APPROVED).',
      qr: 'QR Identity est votre système de passeport numérique sur MERGE STARS. Il inclut Brand QR, Core QR et Referral QR. Chaque scan est enregistré pour l\'attribution et la vérification. Vos QR codes sont liés à votre enregistrement et au statut de production.',
      financing: 'Le financement bancaire est fourni par notre partenaire Crystal, pas par MERGE STARS. L\'approbation dépend de l\'évaluation de crédit et n\'est pas garantie. Structure typique : ~20 % d\'acompte, solde sur 12–24 mois. La production ne commence qu\'après bank_status = APPROVED.',
      referral: 'MERGE STARS utilise uniquement un système de parrainage à un niveau. Les parrainages multi-niveaux (MLM) sont interdits. L\'attribution est enregistrée lorsqu\'une personne s\'inscrit via votre QR ou lien et complète une commande éligible.',
      status: 'Vérifiez le statut de votre demande dans le tableau de bord ou sur /status. Progression : Soumis → En cours d\'examen → Envoyé à Crystal → Approuvé → En production → Livré. Vous recevrez des notifications à chaque étape.',
    },
  },
}
