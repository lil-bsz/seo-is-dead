import { Card, CardContent } from '@/components/ui/card'

const stats = [
  {
    value: '71%',
    description:
      'Of global web traffic still goes through Google in Q4 2025.',
  },
  {
    value: '+26%',
    description:
      'Total search + AI volume growth since 2023 — people search more, not less.',
  },
  {
    value: '1.5B',
    description:
      'Monthly users see Google AI Overviews — SEO fundamentals power those too.',
  },
]

export function WhySeoNotDead() {
  return (
    <section id="why-seo-not-dead" className="scroll-mt-8">
      <h2 className="text-3xl font-bold mb-6">Why SEO is not dead yet?</h2>
      <Card>
        <CardContent className="flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">
              Why SEO is not dead yet?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This narrative comes back every couple of years. Social media was
              supposed to kill SEO. Voice search was supposed to kill SEO. AI is
              the latest candidate. Here's what's actually happening in the data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
              Google still handles the majority of search traffic worldwide. And
              the total volume of search — across all platforms — has grown 26%
              since 2023. People aren't searching less. Demand for information is
              at an all-time high.
            </p>
            <p>
              More importantly, the skills that make good SEO work — quality
              content, topical authority, technical foundations, earning mentions
              from credible sources —{' '}
              <strong className="text-foreground">
                are the same signals AI models use to decide which brands to
                cite.
              </strong>{' '}
              The fundamentals didn't become irrelevant. They became more
              important across more platforms.
            </p>
          </div>

          <div className="rounded-lg bg-muted p-5">
            <p className="text-sm leading-relaxed">
              <strong>
                SEO isn't dying. The surface area it covers is expanding.
              </strong>{' '}
              The 736 Reddit posts above are reacting to a shift, but they're
              misdiagnosing it.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Data: Ecpattern research, March 2026 — analyzing usage across
            ChatGPT, Gemini, Perplexity, Grok, Claude vs. major search engines.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
