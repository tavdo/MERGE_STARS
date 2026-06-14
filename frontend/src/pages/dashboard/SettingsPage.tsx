import { Navigate } from 'react-router-dom'

/** Settings merged into Profile — keep route for old links. */
export default function SettingsPage() {
  return <Navigate to="/dashboard/profile#preferences" replace />
}
