import { Navigate } from 'react-router-dom'

/** Keep the original entry link inside the integrated museum application. */
export default function LivingMuseumExperienceRedirect() {
  return <Navigate to="/living-museum" replace />
}
