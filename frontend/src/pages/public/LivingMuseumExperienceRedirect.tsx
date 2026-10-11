import { useEffect } from 'react'

/** Full-page navigation into the mirrored atelier SPA (static under /living-museum-experience/). */
export default function LivingMuseumExperienceRedirect() {
  useEffect(() => {
    window.location.replace('/living-museum-experience/')
  }, [])

  return null
}
