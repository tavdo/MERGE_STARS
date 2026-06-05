import { useEffect, useRef, useLayoutEffect } from 'react'
import { socket } from '@/lib/socket'

export function useWebSocket<T>(event: string, handler: (payload: T) => void) {
  const handlerRef = useRef(handler)
  
  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const listener = (payload: T) => handlerRef.current(payload)
    socket.on(event, listener)
    return () => { socket.off(event, listener) }
  }, [event])
}
