import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/shared/hooks/useWebSocket'
import { metalsApi, type LiveMetalPrice } from '../api/metals.api'
import { sortMetalsSilverFirst } from '@/shared/utils/metalOrder'

export function useLiveMetalPrices() {
  const cache = useQueryClient()
  const [now, setNow] = useState(Date.now)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [])
  const { data = [] } = useQuery({ queryKey: ['metals-live'], queryFn: () => metalsApi.getLive().then(r => r.data.data), staleTime: 30000, refetchInterval: 30000 })
  useWebSocket<LiveMetalPrice[]>('metals:prices', payload => {
    if (Array.isArray(payload)) cache.setQueryData(['metals-live'], payload)
  })
  return sortMetalsSilverFirst(data.filter(p => p.source && Date.parse(p.validUntil) > now && Number.isFinite(p.priceUsd) && p.priceUsd > 0))
}
