import { Navigate } from 'react-router-dom'

/** Merged into /admin/audit — keep route for old links. */
export default function AuditCenterPage() {
  return <Navigate to="/admin/audit" replace />
}
