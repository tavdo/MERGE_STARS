import { Navigate } from 'react-router-dom'

/** Product registry merged into dashboard home — keep route for old links. */
export default function InvestmentsPage() {
  return <Navigate to="/dashboard#registry" replace />
}
