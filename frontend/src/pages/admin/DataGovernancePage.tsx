import { Navigate } from 'react-router-dom'

export default function DataGovernancePage() {
  return <Navigate to="/admin/compliance?tab=data" replace />
}
