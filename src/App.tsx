import { useState, useCallback, useEffect } from 'react'
import { Counter } from '@/components/Counter'
import { MentionsChart } from '@/components/MentionsChart'
import { RecentMentions } from '@/components/RecentMentions'
import { TopSubreddits } from '@/components/TopSubreddits'
import { WhySeoNotDead } from '@/components/WhySeoNotDead'
import { HowSeoChanging } from '@/components/HowSeoChanging'
import { useCounter } from '@/hooks/use-counter'
import { useRecent } from '@/hooks/use-recent'

export default function App() {
  const { displayCount, isAnimating, refresh: refreshCount } = useCounter()
  const { mentions, hasMore, isLoadingMore, refresh: refreshRecent, loadMore } = useRecent()
  const [chartRefreshKey, setChartRefreshKey] = useState(0)

  useEffect(() => {
    refreshRecent()
  }, [refreshRecent])

  return (
    <div className="min-h-screen flex flex-col items-center">
      <main className="p-8 max-w-[1280px] w-full space-y-12">
        {/* Hero: two-column */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12">
          <div className="text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              Is SEO dead already?
              <br />
              <span className="text-muted-foreground">PS. It is not</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Your daily agregator of
              <br />
              <span className="text-foreground font-semibold">"SEO is dead"</span>
              <br />
              mentions on reddit
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#why-seo-not-dead"
                className="text-sm font-medium text-primary hover:underline"
              >
                Why SEO is not dead yet?
              </a>
              <a
                href="#how-seo-changing"
                className="text-sm font-medium text-primary hover:underline"
              >
                How SEO is changing?
              </a>
            </div>
          </div>
          <div className="text-center md:text-right">
            <Counter displayCount={displayCount} isAnimating={isAnimating} />
          </div>
        </section>

        {/* Chart + Top Subreddits: side-by-side */}
        <section className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
          <MentionsChart refreshKey={chartRefreshKey} />
          <TopSubreddits />
        </section>

        {/* Latest Mentions */}
        <RecentMentions
          mentions={mentions}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
        />

        {/* Why SEO is not dead yet? */}
        <WhySeoNotDead />

        {/* How SEO is changing? */}
        <HowSeoChanging />
      </main>

      <footer className="w-full text-center p-4 text-xs text-muted-foreground mt-8">
        Data sourced from Reddit's public API. Updates every 5 minutes.
      </footer>
    </div>
  )
}
