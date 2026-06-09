export const ROUTES = {
  // Public
  HOME:         '/',
  LOGIN:        '/login',
  REGISTER:     '/register',
  TERMS:        '/terms',

  // User (authenticated)
  DASHBOARD:    '/dashboard',
  PROFILE:      '/dashboard/profile',
  APPLICATIONS: '/dashboard/applications',
  ORDERS:       '/dashboard/orders',
  COINS:        '/dashboard/coins',
  INVESTMENTS:  '/dashboard/investments',
  MESSAGES:     '/dashboard/messages',
  SUPPORT:      '/dashboard/support',
  SETTINGS:     '/dashboard/settings',

  // Admin zone (separate secured area)
  ADMIN:             '/admin',
  ADMIN_LOGIN:       '/admin/login',
  ADMIN_USERS:       '/admin/users',
  ADMIN_KYC:         '/admin/kyc',
  ADMIN_FINANCE:     '/admin/finance',
  ADMIN_APPS:        '/admin/applications',
  ADMIN_APP_DETAIL:  '/admin/applications/:id',
  ADMIN_STATS:       '/admin/stats',
} as const
