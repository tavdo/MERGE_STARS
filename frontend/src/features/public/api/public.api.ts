import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export type RegistrationGoalStats = {
  registeredUsers: number
  goal: number
  remaining: number
  goalReached: boolean
  progressPct: number
}

export const publicApi = {
  registrationGoal: () =>
    api.get<ApiResponse<RegistrationGoalStats>>('/users/public/registration-goal'),
}
