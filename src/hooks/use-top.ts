import { useState, useEffect, useCallback } from 'react'

export interface TopItem {
  subreddit?: string
  author?: string
  count: number
}

export function useTopSubreddits() {
  const [items, setItems] = useState<TopItem[]>([])

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/top-subreddits')
      const data = await res.json()
      setItems(data.items)
    } catch (e) {
      console.error('Failed to fetch top subreddits', e)
    }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  return { items, refresh: fetch_ }
}

export function useTopRedditors() {
  const [items, setItems] = useState<TopItem[]>([])

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/top-redditors')
      const data = await res.json()
      setItems(data.items)
    } catch (e) {
      console.error('Failed to fetch top redditors', e)
    }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  return { items, refresh: fetch_ }
}
