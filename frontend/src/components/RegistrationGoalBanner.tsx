import { useTranslation } from 'react-i18next'
import { useRegistrationGoal } from '@/features/public/hooks/useRegistrationGoal'

type Variant = 'hero' | 'compact'

interface Props {
  variant?: Variant
  className?: string
}

export default function RegistrationGoalBanner({ variant = 'hero', className = '' }: Props) {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useRegistrationGoal()

  if (isError) return null

  const registered = data?.registeredUsers ?? 0
  const goal = data?.goal ?? 1000
  const remaining = data?.remaining ?? Math.max(0, goal - registered)
  const progress = data?.progressPct ?? Math.min(100, Math.round((registered / goal) * 100))
  const reached = data?.goalReached ?? registered >= goal

  const title = reached
    ? t('registrationGoal.titleReached')
    : t('registrationGoal.title')

  const isCompact = variant === 'compact'

  return (
    <div
      className={`registration-goal${reached ? ' registration-goal--reached' : ''}${isCompact ? ' registration-goal--compact' : ''} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <p className="registration-goal__title">{title}</p>

      <div className="registration-goal__meta">
        <span className="registration-goal__count">
          {isLoading
            ? '…'
            : t('registrationGoal.progress', { current: registered.toLocaleString(), goal: goal.toLocaleString() })}
        </span>
        {!reached && !isLoading && (
          <span className="registration-goal__remaining">
            {t('registrationGoal.remaining', { count: remaining.toLocaleString() })}
          </span>
        )}
        {reached && !isLoading && (
          <span className="registration-goal__remaining registration-goal__remaining--done">
            {t('registrationGoal.reached')}
          </span>
        )}
      </div>

      <div
        className="registration-goal__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Math.min(registered, goal)}
        aria-label={title}
      >
        <div
          className="registration-goal__fill"
          style={{ width: isLoading ? '0%' : `${progress}%` }}
        />
      </div>
    </div>
  )
}
