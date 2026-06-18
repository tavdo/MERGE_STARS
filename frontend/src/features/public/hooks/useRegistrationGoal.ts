import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../api/public.api'

export function useRegistrationGoal() {
  return useQuery({
    queryKey: ['registration-goal'],
    queryFn: () => publicApi.registrationGoal().then((r) => r.data.data),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
