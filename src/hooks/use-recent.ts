import { useState, useCallback } from 'react'

export interface Mention {
  subreddit: string
  permalink: string
  body: string
  created_utc: number
  type: 'post' | 'comment'
  author: string | null
}

interface RecentResponse {
  items: Mention[]
  total: number
  hasMore: boolean
}

const PAGE_SIZE = 12

export function useRecent() {
  const [mentions, setMentions] = useState<Mention[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch(`/api/recent?limit=${PAGE_SIZE}&offset=0`)
      const data: RecentResponse = await res.json()
      setMentions(data.items)
      setHasMore(data.hasMore)
    } catch (e) {
      console.error('Failed to fetch recent', e)
    }
  }, [])

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/recent?limit=${PAGE_SIZE}&offset=${mentions.length}`)
      const data: RecentResponse = await res.json()
      setMentions((prev) => [...prev, ...data.items])
      setHasMore(data.hasMore)
    } catch (e) {
      console.error('Failed to load more', e)
    }
    setIsLoadingMore(false)
  }, [mentions.length])

  return { mentions, hasMore, isLoadingMore, refresh: fetchRecent, loadMore }
}

export function timeAgo(epoch: number): string {
  const seconds = Math.floor(Date.now() / 1000 - epoch)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago'
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago'
  return Math.floor(seconds / 86400) + 'd ago'
}
