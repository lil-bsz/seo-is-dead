import { useState, useEffect, useRef, useCallback } from 'react'

export function useCounter(pollInterval = 30000) {
  const [count, setCount] = useState(0)
  const [displayCount, setDisplayCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number>(0)

  const animateCount = useCallback((from: number, to: number) => {
    if (from === to) return
    const duration = 1000
    const start = performance.now()
    setIsAnimating(true)

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = Math.round(from + (to - from) * eased)
      setDisplayCount(value)
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step)
      } else {
        setIsAnimating(false)
      }
    }

    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = requestAnimationFrame(step)
  }, [])

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/count')
      const data = await res.json()
      setCount((prev) => {
        if (data.count !== prev) {
          animateCount(prev, data.count)
        }
        return data.count
      })
    } catch (e) {
      console.error('Failed to fetch count', e)
    }
  }, [animateCount])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, pollInterval)
    return () => {
      clearInterval(interval)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [pollInterval, fetchCount])

  return { count, displayCount, isAnimating, refresh: fetchCount }
}
