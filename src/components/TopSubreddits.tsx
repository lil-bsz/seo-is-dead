import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTopSubreddits, useTopRedditors } from '@/hooks/use-top'

type Tab = 'subreddits' | 'redditors'

export function TopSubreddits() {
  const [tab, setTab] = useState<Tab>('subreddits')
  const { items: subreddits } = useTopSubreddits()
  const { items: redditors } = useTopRedditors()

  const items = tab === 'subreddits' ? subreddits : redditors

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex gap-1">
          <Button
            variant={tab === 'subreddits' ? 'default' : 'outline'}
            size="xs"
            onClick={() => setTab('subreddits')}
          >
            Top Subreddits
          </Button>
          <Button
            variant={tab === 'redditors' ? 'default' : 'outline'}
            size="xs"
            onClick={() => setTab('redditors')}
          >
            Top Redditors
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-4 font-medium"></th>
              <th className="pb-2 pr-4 font-medium">
                {tab === 'subreddits' ? 'Subreddit' : 'Redditor'}
              </th>
              <th className="pb-2 text-right font-medium">#</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.subreddit || item.author} className="border-b last:border-0">
                <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                <td className="py-2 pr-4">
                  {tab === 'subreddits' ? (
                    <a
                      href={`https://reddit.com/r/${item.subreddit}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      r/{item.subreddit}
                    </a>
                  ) : (
                    <a
                      href={`https://reddit.com/u/${item.author}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      u/{item.author}
                    </a>
                  )}
                </td>
                <td className="py-2 text-right font-medium">{item.count}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
