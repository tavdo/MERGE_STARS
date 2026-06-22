import { Navigate } from 'react-router-dom'

export default function SecurityCenterPage() {
  return <Navigate to="/admin/compliance?tab=security" replace />
}
