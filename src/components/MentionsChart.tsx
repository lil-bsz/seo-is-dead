import { useEffect } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { useChart, type ChartRange } from '@/hooks/use-chart'

const chartConfig = {
  count: {
    label: 'Mentions',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

const RANGES: { value: ChartRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
]

function formatXAxisLabel(date: string, range: ChartRange): string {
  if (range === 'today') {
    const hour = date.split(' ')[1]
    return `${hour}:00`
  }
  if (range === '7d' || range === '30d') {
    const d = new Date(date + 'T00:00:00Z')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  }
  const [y, m] = date.split('-')
  const d = new Date(Number(y), Number(m) - 1)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

interface MentionsChartProps {
  refreshKey?: number
}

export function MentionsChart({ refreshKey }: MentionsChartProps) {
  const { data, range, isLoading, changeRange, refresh } = useChart()

  useEffect(() => {
    changeRange('30d')
  }, [])

  useEffect(() => {
    if (refreshKey) refresh()
  }, [refreshKey])

  const xAxisInterval = range === '30d' ? 4 : range === 'all' ? 'preserveStartEnd' : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Mentions over time</CardTitle>
            <CardDescription>
              {range === 'today' ? 'Hourly' : range === 'all' ? 'Monthly' : 'Daily'} breakdown
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {RANGES.map(({ value, label }) => (
              <Button
                key={value}
                variant={range === value ? 'default' : 'outline'}
                size="xs"
                onClick={() => changeRange(value)}
                disabled={isLoading}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Loading chart data...
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={xAxisInterval}
                tickFormatter={(value) => formatXAxisLabel(value, range)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="count"
                type="monotone"
                fill="url(#fillCount)"
                stroke="var(--color-count)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
