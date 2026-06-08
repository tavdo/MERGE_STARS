import { Navigate } from 'react-router-dom'

/** Registration lives on LoginPage (register tab). */
export default function RegisterPage() {
  return <Navigate to="/login?tab=register" replace />
}
