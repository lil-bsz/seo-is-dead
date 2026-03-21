import { type Mention } from '@/hooks/use-recent'
import { MentionCard } from './MentionCard'
import { Button } from '@/components/ui/button'

interface RecentMentionsProps {
  mentions: Mention[]
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

export function RecentMentions({ mentions, hasMore, isLoadingMore, onLoadMore }: RecentMentionsProps) {
  return (
    <div className="text-left mt-8">
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
        Latest mentions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mentions.map((mention) => (
          <MentionCard key={mention.permalink} mention={mention} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Show more'}
          </Button>
        </div>
      )}
    </div>
  )
}
