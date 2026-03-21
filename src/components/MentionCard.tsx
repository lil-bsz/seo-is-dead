import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type Mention, timeAgo } from '@/hooks/use-recent'
import { ChatCircle, Article, ArrowRight } from '@phosphor-icons/react'

interface MentionCardProps {
  mention: Mention
}

function UserAvatar({ username }: { username: string }) {
  return (
    <img
      src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(username)}&radius=50&backgroundColor=6366f1,8b5cf6,3b82f6,06b6d4,10b981&fontSize=40`}
      alt={username}
      className="size-5 rounded-full"
      loading="lazy"
    />
  )
}

export function MentionCard({ mention }: MentionCardProps) {
  const snippet = (mention.body || '').slice(0, 80)
  const truncated = mention.body && mention.body.length > 80

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`https://reddit.com${mention.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            <Badge>r/{mention.subreddit}</Badge>
          </a>
          <Badge variant="outline" className="gap-1">
            {mention.type === 'comment' ? (
              <ChatCircle weight="bold" className="size-3" />
            ) : (
              <Article weight="bold" className="size-3" />
            )}
            {mention.type === 'comment' ? 'Comment' : 'Post'}
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">
            {timeAgo(mention.created_utc)}
          </span>
        </div>
        {mention.author && (
          <div className="flex items-center gap-1.5">
            <UserAvatar username={mention.author} />
            <a
              href={`https://reddit.com/u/${mention.author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-foreground hover:underline"
            >
              u/{mention.author}
            </a>
          </div>
        )}
        <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
          {snippet}{truncated ? '...' : ''}
        </p>
        {mention.permalink && (
          <a
            href={`https://reddit.com${mention.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 mt-1"
          >
            Reply to {mention.author || 'user'} why SEO is not dead
            <ArrowRight weight="bold" className="size-3" />
          </a>
        )}
      </CardContent>
    </Card>
  )
}
