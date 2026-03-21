import { useState, useCallback } from 'react'

export type ChartRange = 'today' | '7d' | '30d' | 'all'

export interface ChartDataPoint {
  date: string
  count: number
}

function fillGaps(data: ChartDataPoint[], range: ChartRange): ChartDataPoint[] {
  if (data.length === 0) return data
  if (range === 'all') return data

  const filled: ChartDataPoint[] = []
  const dataMap = new Map(data.map(d => [d.date, d.count]))

  if (range === 'today') {
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = String(now.getUTCMonth() + 1).padStart(2, '0')
    const day = String(now.getUTCDate()).padStart(2, '0')
    for (let h = 0; h <= now.getUTCHours(); h++) {
      const key = `${year}-${month}-${day} ${String(h).padStart(2, '0')}`
      filled.push({ date: key, count: dataMap.get(key) || 0 })
    }
  } else {
    const days = range === '7d' ? 7 : 30
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setUTCDate(d.getUTCDate() - i)
      const key = d.toISOString().slice(0, 10)
      filled.push({ date: key, count: dataMap.get(key) || 0 })
    }
  }

  return filled
}

export function useChart() {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [range, setRange] = useState<ChartRange>('30d')
  const [isLoading, setIsLoading] = useState(false)

  const fetchChart = useCallback(async (r: ChartRange) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/chart?range=${r}`)
      const json = await res.json()
      setData(fillGaps(json.data, r))
    } catch (e) {
      console.error('Failed to fetch chart data', e)
    }
    setIsLoading(false)
  }, [])

  const changeRange = useCallback((r: ChartRange) => {
    setRange(r)
    fetchChart(r)
  }, [fetchChart])

  return { data, range, isLoading, changeRange, refresh: () => fetchChart(range) }
}
