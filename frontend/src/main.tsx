import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './i18n'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'
import { getCookieConsent, initAnalyticsIfConsented } from './utils/cookieConsent'

if (getCookieConsent() === 'all') {
  initAnalyticsIfConsented()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
