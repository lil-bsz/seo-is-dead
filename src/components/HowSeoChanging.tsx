import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const stats = [
  {
    value: '92-99%',
    description:
      'Of AI citations come from topic-specific sources — industry publications, review sites, expert blogs. Not general platforms.',
  },
  {
    value: '~35%',
    description:
      'Of AI visibility is driven by citation frequency — how often your brand appears across credible, niche sources.',
  },
  {
    value: '44.2%',
    description:
      'Of AI citations reference content from the first 30% of a page. Content structure matters — front-load your key points.',
  },
  {
    value: '11%',
    description:
      'Of domains are cited by both ChatGPT and Perplexity. Each platform has different source preferences.',
  },
]

export function HowSeoChanging() {
  return (
    <section id="how-seo-changing" className="scroll-mt-8">
      <h2 className="text-3xl font-bold mb-6">How SEO is changing?</h2>
      <Card>
        <CardContent className="flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">
              How SEO is changing?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              The real story isn't that SEO is dead — it's that search is no
              longer one channel. Google's global traffic share dropped from 85%
              to 71% in two years. That 14 points didn't vanish — it moved to AI
              platforms that now generate 4.5 billion sessions per month.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              For SEO professionals, this means the same discipline now applies
              across a wider landscape. Here's what the data shows about how AI
              discovery actually works:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div key={stat.value}>
                <div className="text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The practical takeaway: AI models reward the same things good SEOs
              already do — authoritative content, strong topical coverage,
              presence across credible third-party sources. The difference is
              that Google shows you exactly where you rank.{' '}
              <strong className="text-foreground">
                AI platforms don't give you that visibility by default.
              </strong>
            </p>
            <p>
              Today, "search optimization" means being visible across multiple
              discovery channels, not just one.
            </p>
          </div>

          <div className="rounded-lg bg-muted p-5 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  G
                </span>
                <span className="text-sm font-medium">
                  Google organic + AI overviews
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Still the largest channel. Your existing SEO work powers this.
              </p>
              <div className="h-3 rounded-full bg-primary/20 w-full">
                <div
                  className="h-3 rounded-full bg-primary"
                  style={{ width: '71%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">71%</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-foreground text-background text-xs font-bold">
                  AI
                </span>
                <span className="text-sm font-medium">
                  AI platforms (ChatGPT, Gemini, Perplexity)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Growing fast. Same content quality signals, different visibility
                tools needed.
              </p>
              <div className="h-3 rounded-full bg-foreground/20 w-full">
                <div
                  className="h-3 rounded-full bg-foreground"
                  style={{ width: '29%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">~29%</p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              See how AI platforms describe your brand today.
            </p>
            <a
              href="https://www.getmentioned.co/pl/visibility-reports"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg">Check your AI visibility — free</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
