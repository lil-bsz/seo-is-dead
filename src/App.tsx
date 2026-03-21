import { useState, useCallback, useEffect } from 'react'
import { Counter } from '@/components/Counter'
import { MentionsChart } from '@/components/MentionsChart'
import { RecentMentions } from '@/components/RecentMentions'
import { Button } from '@/components/ui/button'
import { useCounter } from '@/hooks/use-counter'
import { useRecent } from '@/hooks/use-recent'
import { ArrowsClockwise } from '@phosphor-icons/react'

export default function App() {
  const { displayCount, isAnimating, refresh: refreshCount } = useCounter()
  const { mentions, hasMore, isLoadingMore, refresh: refreshRecent, loadMore } = useRecent()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [chartRefreshKey, setChartRefreshKey] = useState(0)

  useEffect(() => {
    refreshRecent()
  }, [refreshRecent])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setChartRefreshKey(k => k + 1)
    await Promise.all([refreshCount(), refreshRecent()])
    setIsRefreshing(false)
  }, [refreshCount, refreshRecent])

  return (
    <div className="min-h-screen flex flex-col items-center">
      <main className="text-center p-8 max-w-[1280px] w-full">
        <div className="py-12">
          <Counter displayCount={displayCount} isAnimating={isAnimating} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mb-8"
          >
            <ArrowsClockwise className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh data'}
          </Button>
        </div>
        <div className="mb-8">
          <MentionsChart refreshKey={chartRefreshKey} />
        </div>
        <RecentMentions
          mentions={mentions}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
        />
      </main>
      <footer className="w-full text-center p-4 text-xs text-muted-foreground mt-8">
        Data sourced from Reddit's public API. Updates every 5 minutes.
      </footer>
    </div>
  )
}
