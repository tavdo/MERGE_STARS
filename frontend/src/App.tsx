import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

// Core pages
import LandingPage       from './pages/LandingPage'
import LoginPage         from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage     from './pages/DashboardPage'
import ApplicationPage   from './pages/ApplicationPage'
import CalculatorPage    from './pages/CalculatorPage'
import StatusPage        from './pages/StatusPage'

// Public pages
import HowItWorksPage    from './pages/public/HowItWorksPage'
import MergeCoinPage     from './pages/public/MergeCoinPage'
import PriceIndicatorPage from './pages/public/PriceIndicatorPage'
import FAQPage           from './pages/public/FAQPage'
import ContactPage       from './pages/public/ContactPage'
import TermsPage         from './pages/public/TermsPage'
import PrivacyPage       from './pages/public/PrivacyPage'
import ReferralPolicyPage from './pages/public/ReferralPolicyPage'
import TrustCenterPage from './pages/public/TrustCenterPage'
import LegalClassificationPage from './pages/public/LegalClassificationPage'

// Dashboard pages
import BrandLinePage     from './pages/dashboard/BrandLinePage'
import CollectionsPage   from './pages/dashboard/CollectionsPage'
import CollectionDetailPage from './pages/dashboard/CollectionDetailPage'
import CollectionsBrowsePage from './pages/public/CollectionsBrowsePage'
import QRIdentityPage    from './pages/dashboard/QRIdentityPage'
import OrdersPage        from './pages/dashboard/OrdersPage'
import PaymentPage       from './pages/dashboard/PaymentPage'
import DeliveryPage      from './pages/dashboard/DeliveryPage'
import ReferralPage      from './pages/dashboard/ReferralPage'
import AIAssistantPage   from './pages/dashboard/AIAssistantPage'
import ProfilePage       from './pages/dashboard/ProfilePage'
import CoinsPage         from './pages/dashboard/CoinsPage'
import MessagesPage      from './pages/dashboard/MessagesPage'
import SettingsPage      from './pages/dashboard/SettingsPage'
import InvestmentsPage   from './pages/dashboard/InvestmentsPage'
import SupportPage       from './pages/dashboard/SupportPage'

// Admin pages
import AdminPage         from './pages/AdminPage'
import AdminUsersPage    from './pages/admin/AdminUsersPage'
import AdminKYCPage      from './pages/admin/AdminKYCPage'
import AdminFinancePage  from './pages/admin/AdminFinancePage'
import AdminCrystalPage  from './pages/admin/AdminCrystalPage'
import AdminProductionPage from './pages/admin/AdminProductionPage'
import AdminAuditPage    from './pages/admin/AdminAuditPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import BankReviewPage from './pages/admin/BankReviewPage'
import SecurityCenterPage from './pages/admin/SecurityCenterPage'
import DataGovernancePage from './pages/admin/DataGovernancePage'
import BusinessContinuityPage from './pages/admin/BusinessContinuityPage'
import AuditCenterPage from './pages/admin/AuditCenterPage'

import './App.css'
import LuxuryCursor from './components/LuxuryCursor'
import AIAssistantWidget from './components/AIAssistantWidget'
import AuthGuard from './router/guards/AuthGuard'
import AdminGuard from './router/guards/AdminGuard'
import AdminLoginPage from './pages/admin/AdminLoginPage'

function useLuxuryCursorEnabled() {
  const { pathname } = useLocation()
  return pathname === '/' && !pathname.startsWith('/admin')
}

function useAdminZone() {
  const { pathname } = useLocation()
  return pathname.startsWith('/admin')
}

function AppRoutes() {
  const luxuryCursor = useLuxuryCursorEnabled()
  const adminZone = useAdminZone()

  return (
    <>
      {luxuryCursor && <LuxuryCursor />}
      {!adminZone && <AIAssistantWidget />}
      <Routes>
        {/* Public */}
        <Route path="/"                element={<LandingPage />} />
        <Route path="/how-it-works"    element={<HowItWorksPage />} />
        <Route path="/merge-coin"      element={<MergeCoinPage />} />
        <Route path="/price-indicator" element={<PriceIndicatorPage />} />
        <Route path="/faq"             element={<FAQPage />} />
        <Route path="/contact"         element={<ContactPage />} />
        <Route path="/terms"                  element={<TermsPage />} />
        <Route path="/terms-and-conditions"  element={<Navigate to="/terms" replace />} />
        <Route path="/privacy"         element={<PrivacyPage />} />
        <Route path="/referral-policy" element={<ReferralPolicyPage />} />
        <Route path="/trust" element={<TrustCenterPage />} />
        <Route path="/legal-classification" element={<LegalClassificationPage />} />
        <Route path="/collections"          element={<CollectionsBrowsePage />} />
        <Route path="/collections/:slug"   element={<CollectionsBrowsePage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<Navigate to="/login?tab=register" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* Authenticated — user area */}
        <Route element={<AuthGuard />}>
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
          <Route path="/calculator"         element={<CalculatorPage />} />
          <Route path="/status"             element={<StatusPage />} />
        </Route>

        {/* Admin zone — separate secured area at /admin/* */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/bank-review" element={<Navigate to="/admin/bank-review" replace />} />
        <Route path="/audit" element={<Navigate to="/admin/audit-center" replace />} />
        <Route path="/security" element={<Navigate to="/admin/security" replace />} />
        <Route path="/data-governance" element={<Navigate to="/admin/data-governance" replace />} />
        <Route path="/business-continuity" element={<Navigate to="/admin/business-continuity" replace />} />

        <Route element={<AdminGuard />}>
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
          <Route path="/admin/audit-center" element={<AuditCenterPage />} />
          <Route path="/admin/security" element={<SecurityCenterPage />} />
          <Route path="/admin/data-governance" element={<DataGovernancePage />} />
          <Route path="/admin/business-continuity" element={<BusinessContinuityPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
