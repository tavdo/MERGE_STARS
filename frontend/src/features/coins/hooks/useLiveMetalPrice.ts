import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWebSocket } from '@/shared/hooks/useWebSocket'
import { socket } from '@/lib/socket'
import { metalsApi, type LiveMetalPrice } from '../api/metals.api'

export function useLiveMetalPrices() {
  const { data: initial } = useQuery({
    queryKey: ['metals-live'],
    queryFn: () => metalsApi.getLive().then((r) => r.data.data),
    staleTime: 30_000,
  })

  const [prices, setPrices] = useState<LiveMetalPrice[]>([])

  useEffect(() => {
    if (initial?.length) setPrices(initial)
  }, [initial])

  useEffect(() => {
    if (!socket.connected) socket.connect()
  }, [])

  useWebSocket<LiveMetalPrice[]>('metals:prices', (payload) => {
    if (payload?.length) setPrices(payload)
  })

  return prices.length ? prices : (initial ?? [])
}
