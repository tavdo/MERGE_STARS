import landingCircuitBg from '@/assets/landing-circuit-bg.svg'

/** Fixed circuit artwork behind the whole app. */
export default function SiteBackground() {
  return (
    <div className="site-bg" aria-hidden>
      <img src={landingCircuitBg} alt="" />
    </div>
  )
}
