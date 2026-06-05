import assistantLogo from '@/assets/assistant-logo.png'

type SiteLogoProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASS = {
  sm: 'site-logo--sm',
  md: 'site-logo--md',
  lg: 'site-logo--lg',
} as const

export default function SiteLogo({ className = '', size = 'md' }: SiteLogoProps) {
  return (
    <img
      src={assistantLogo}
      alt=""
      className={`site-logo ${SIZE_CLASS[size]} ${className}`.trim()}
      aria-hidden
    />
  )
}
