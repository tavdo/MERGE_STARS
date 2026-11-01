import SeoHead from './components/SeoHead'
import SiteBackground from './components/SiteBackground'
import SiteLayout from './components/SiteLayout'
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/public/TermsPage'))
const ContactPage = lazy(() => import('./pages/public/ContactPage'))
const FAQPage = lazy(() => import('./pages/public/FAQPage'))
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage'))
const FilamentTechnologyPage = lazy(() => import('./pages/public/FilamentTechnologyPage'))
const MergeCoinPage = lazy(() => import('./pages/public/MergeCoinPage'))
const CollectionsBrowsePage = lazy(() => import('./pages/public/CollectionsBrowsePage'))
const BrandRoomPage = lazy(() => import('./pages/public/BrandRoomPage'))
const LivingMuseumPage = lazy(() => import('./pages/public/LivingMuseumPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const AdminCoinConfiguratorPage = lazy(() => import('./pages/admin/AdminCoinConfiguratorPage'))
const AdminMasterCatalogPage = lazy(() => import('./pages/admin/AdminMasterCatalogPage'))
const AdminAiTrainingPage = lazy(() => import('./pages/admin/AdminAiTrainingPage'))
const CoinConfiguratorPage = lazy(() => import('./pages/dashboard/CoinConfiguratorPage'))
const WalletPage = lazy(() => import('./pages/dashboard/WalletPage'))
const MasterCatalogPage = lazy(() => import('./pages/dashboard/MasterCatalogPage'))
const ProductPassportPage = lazy(() => import('./pages/public/ProductPassportPage'))
const LivingMuseumExperienceRedirect = lazy(() => import('./pages/public/LivingMuseumExperienceRedirect'))

// Core pages
const DesignReviewPage = lazy(() => import('./pages/admin/DesignReviewPage'))
const MaterialLabAdmin = lazy(() => import('./material-lab/MaterialLabAdmin'))
const MergeExperience = lazy(() => import('./experience/MergeExperience'))
const LivingMuseum = lazy(() => import('./museum-v78/MuseumV78'))
const PersonalMuseum = lazy(() => import('./living-museum/PersonalMuseum'))
const MuseumTransparency = lazy(() => import('./living-museum/Transparency'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ApplicationPage = lazy(() => import('./pages/ApplicationPage'))
const StatusPage = lazy(() => import('./pages/StatusPage'))

// Public pages
const PriceIndicatorPage = lazy(() => import('./pages/public/PriceIndicatorPage'))
const ReferralPolicyPage = lazy(() => import('./pages/public/ReferralPolicyPage'))
const TrustCenterPage = lazy(() => import('./pages/public/TrustCenterPage'))
const LegalClassificationPage = lazy(() => import('./pages/public/LegalClassificationPage'))

// Dashboard pages
const BrandLinePage = lazy(() => import('./pages/dashboard/BrandLinePage'))
const CollectionsPage = lazy(() => import('./pages/dashboard/CollectionsPage'))
const CollectionDetailPage = lazy(() => import('./pages/dashboard/CollectionDetailPage'))
const BrandPublicPage = lazy(() => import('./pages/public/BrandPublicPage'))
const MemberPublicPage = lazy(() => import('./pages/public/MemberPublicPage'))
const QRIdentityPage = lazy(() => import('./pages/dashboard/QRIdentityPage'))
const OrdersPage = lazy(() => import('./pages/dashboard/OrdersPage'))
const PaymentPage = lazy(() => import('./pages/dashboard/PaymentPage'))
const DeliveryPage = lazy(() => import('./pages/dashboard/DeliveryPage'))
const ReferralPage = lazy(() => import('./pages/dashboard/ReferralPage'))
const AIAssistantPage = lazy(() => import('./pages/dashboard/AIAssistantPage'))
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'))
const CoinsPage = lazy(() => import('./pages/dashboard/CoinsPage'))
const MessagesPage = lazy(() => import('./pages/dashboard/MessagesPage'))
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'))
const InvestmentsPage = lazy(() => import('./pages/dashboard/InvestmentsPage'))
const SupportPage = lazy(() => import('./pages/dashboard/SupportPage'))

// Admin pages
const AdminPage = lazy(() => import('./pages/AdminPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminKYCPage = lazy(() => import('./pages/admin/AdminKYCPage'))
const AdminFinancePage = lazy(() => import('./pages/admin/AdminFinancePage'))
const AdminCrystalPage = lazy(() => import('./pages/admin/AdminCrystalPage'))
const AdminProductionPage = lazy(() => import('./pages/admin/AdminProductionPage'))
const AdminAuditPage = lazy(() => import('./pages/admin/AdminAuditPage'))
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const BankReviewPage = lazy(() => import('./pages/admin/BankReviewPage'))
const SecurityCenterPage = lazy(() => import('./pages/admin/SecurityCenterPage'))
const DataGovernancePage = lazy(() => import('./pages/admin/DataGovernancePage'))
const BusinessContinuityPage = lazy(() => import('./pages/admin/BusinessContinuityPage'))
const ComplianceHubPage = lazy(() => import('./pages/admin/ComplianceHubPage'))
const AuditCenterPage = lazy(() => import('./pages/admin/AuditCenterPage'))

import './App.css'
import LuxuryCursor from './components/LuxuryCursor'
import AIAssistantWidget from './components/AIAssistantWidget'
import AuthGuard from './router/guards/AuthGuard'
import AdminGuard from './router/guards/AdminGuard'
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
import CookieConsent from './components/CookieConsent'

function useLuxuryCursorEnabled() { return false }

function useAdminZone() {
  const { pathname } = useLocation()
  return pathname.startsWith('/admin')
}

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function AppRoutes() {
  const { t } = useTranslation()
  const luxuryCursor = useLuxuryCursorEnabled()
  const adminZone = useAdminZone()
  const { pathname } = useLocation()
  const experienceZone = pathname === '/' || ['/museum', '/living-museum', '/my-museum', '/my-saved', '/my-world', '/fit-profile', '/digital-twin', '/my-designs', '/pulse', '/notifications', '/chat', '/track', '/object', '/collection', '/material-lab', '/create', '/calculate', '/materials', '/fit-to-me', '/houses', '/brand-house', '/for-brands', '/request-brand', '/exhibit', '/about'].some(route => pathname === route || pathname.startsWith(route + '/'))

  return (
    <>
      {luxuryCursor && <LuxuryCursor />}
      {!adminZone && !experienceZone && <AIAssistantWidget />}
      <SeoHead />
      <CookieConsent />
      <Suspense fallback={<div role="status" className="page-hero"><div className="animate-pulse h-6 w-48 bg-neutral-800 mx-auto mb-4 rounded" />{t('common.loading')}</div>}>
      <Routes>
        {/* Public */}
        <Route path="/material-lab/demo-admin" element={<MaterialLabAdmin demo />} />
        {['/my-saved', '/my-world', '/fit-profile', '/digital-twin/local-draft', '/my-designs', '/pulse', '/notifications', '/chat', '/track', '/object/:slug/:id', '/collection/:slug', '/material-lab', '/material-lab/passport/:batchId', '/create', '/calculate', '/materials', '/digital-twin', '/fit-to-me', '/houses', '/brand-house', '/for-brands', '/request-brand', '/passport', '/exhibit/:id', '/about'].map(path => <Route key={path} path={path} element={<MergeExperience />} />)}
        <Route path="/my-museum" element={<PersonalMuseum />} />
        <Route path="/"                element={<div className="museum-home"><SiteLayout><LivingMuseum /></SiteLayout></div>} />
        <Route path="/transparency" element={<div className="living-museum"><MuseumTransparency /></div>} />
        <Route path="/living-museum" element={<LivingMuseum />} /><Route path="/museum" element={<LivingMuseum />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/merge-coin" element={<MergeCoinPage />} />
        <Route path="/filament" element={<FilamentTechnologyPage />} />
        <Route path="/price-indicator" element={<PriceIndicatorPage />} />
        <Route path="/verification" element={<Navigate to="/material-lab" replace />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-and-conditions"  element={<Navigate to="/terms" replace />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/referral-policy" element={<ReferralPolicyPage />} />
        <Route path="/trust" element={<TrustCenterPage />} />
        <Route path="/legal-classification" element={<LegalClassificationPage />} />
        <Route path="/collections" element={<CollectionsBrowsePage />} />
        <Route path="/collections/:slug" element={<CollectionsBrowsePage />} />
        <Route path="/brand-room" element={<BrandRoomPage />} />
        <Route path="/b/:brandLineId"      element={<BrandPublicPage />} />
        <Route path="/u/:mergeId"          element={<MemberPublicPage mode="member" />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<Navigate to="/login?tab=register" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* Authenticated — user area */}
        <Route element={<AuthGuard />}>
          <Route path="/fill-coin" element={<CoinConfiguratorPage />} />

          <Route path="/dashboard/fill-coin"  element={<CoinConfiguratorPage />} />
          <Route path="/dashboard/wallet"       element={<WalletPage />} />
          <Route path="/dashboard/master-catalog" element={<MasterCatalogPage />} />
          <Route path="/dashboard"              element={<DashboardPage />} />
          <Route path="/dashboard/profile"      element={<ProfilePage />} />
          <Route path="/dashboard/coins"        element={<CoinsPage />} />
          <Route path="/dashboard/investments"  element={<InvestmentsPage />} />
          <Route path="/dashboard/messages"     element={<MessagesPage />} />
          <Route path="/dashboard/settings"     element={<SettingsPage />} />
          <Route path="/dashboard/support"      element={<SupportPage />} />
          <Route path="/dashboard/brand"        element={<BrandLinePage />} />
          <Route path="/dashboard/collections"  element={<CollectionsPage />} />
          <Route path="/dashboard/collections/:id" element={<CollectionDetailPage />} />
          <Route path="/dashboard/qr"           element={<QRIdentityPage />} />
          <Route path="/dashboard/orders"       element={<OrdersPage />} />
          <Route path="/dashboard/payment"      element={<PaymentPage />} />
          <Route path="/dashboard/delivery"      element={<DeliveryPage />} />
          <Route path="/dashboard/referral"      element={<ReferralPage />} />
          <Route path="/dashboard/ai"            element={<AIAssistantPage />} />
          <Route path="/apply"              element={<ApplicationPage />} />
          <Route path="/production-request" element={<ApplicationPage />} />
          <Route path="/calculator"         element={<Navigate to="/fill-coin" replace />} />
          <Route path="/status"             element={<StatusPage />} />
        </Route>

        {/* Admin zone — separate secured area at /admin/* */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/bank-review" element={<Navigate to="/admin/bank-review" replace />} />
        <Route path="/audit" element={<Navigate to="/admin/audit" replace />} />
        <Route path="/security" element={<Navigate to="/admin/compliance?tab=security" replace />} />
        <Route path="/data-governance" element={<Navigate to="/admin/compliance?tab=data" replace />} />
        <Route path="/business-continuity" element={<Navigate to="/admin/compliance?tab=continuity" replace />} />

        <Route element={<AdminGuard />}>
          <Route path="/admin/coin-configurator" element={<AdminCoinConfiguratorPage />} />
          <Route path="/admin/master-catalog" element={<AdminMasterCatalogPage />} />
          <Route path="/admin/ai-training" element={<AdminAiTrainingPage />} />
          <Route path="/admin/design-reviews" element={<DesignReviewPage />} /><Route path="/admin/material-lab" element={<MaterialLabAdmin />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/kyc" element={<AdminKYCPage />} />
          <Route path="/admin/finance" element={<AdminFinancePage />} />
          <Route path="/admin/crystal" element={<AdminCrystalPage />} />
          <Route path="/admin/production" element={<AdminProductionPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/bank-review" element={<BankReviewPage />} />
          <Route path="/admin/compliance" element={<ComplianceHubPage />} />
          <Route path="/admin/audit-center" element={<AuditCenterPage />} />
          <Route path="/admin/security" element={<SecurityCenterPage />} />
          <Route path="/admin/data-governance" element={<DataGovernancePage />} />
          <Route path="/admin/business-continuity" element={<BusinessContinuityPage />} />
        </Route>
        <Route path="/living-museum/enter" element={<LivingMuseumExperienceRedirect />} />
        <Route path="/passport/:publicId"   element={<ProductPassportPage />} />

        <Route path="/classic" element={<LandingPage />} />
        <Route path="/museum/classic" element={<LivingMuseumPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteBackground />
      <AppRoutes />
    </BrowserRouter>
  )
}




