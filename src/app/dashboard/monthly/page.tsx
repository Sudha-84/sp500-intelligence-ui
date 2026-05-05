'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts'
import { useMonthlyTrend } from '@/hooks/useMonthlyTrend'
import { SignalPill } from '@/components/ui/SignalPill'
import { MetricCard } from '@/components/ui/MetricCard'
import { GrokReasoningCard } from '@/components/dashboard/GrokReasoningCard'
import { Spinner } from '@/components/ui/Spinner'
import { TickerSearch } from '@/components/dashboard/TickerSearch'

const TICKERS = [
  { sym: 'SPX',  name: 'S&P 500 Index' },
  { sym: 'NVDA', name: 'Nvidia Corp' },
  { sym: 'AAPL', name: 'Apple Inc' },
  { sym: 'TSLA', name: 'Tesla Inc' },
  { sym: 'MSFT', name: 'Microsoft Corp' },
  { sym: 'AMZN', name: 'Amazon.com' },
  { sym: 'META', name: 'Meta Platforms' },
  { sym: 'GOOGL', name: 'Alphabet Inc' },
  { sym: 'JPM',  name: 'JPMorgan Chase' },
]

export default function MonthlyTrendPage() {
  const [ticker, setTicker]       = useState('SPX')
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  const { data, isLoading } = useMonthlyTrend(ticker)

  const selectedData = selectedMonth !== null ? data?.monthly?.[selectedMonth] : null
  const displayMonth = selectedData ?? data?.monthly?.[data?.monthly?.length - 1]

  const bullishMonths = data?.monthly?.filter(m => m.signal === 'BULLISH').length ?? 0
  const totalMonths   = data?.monthly?.length ?? 0
  const overallReturn = data?.monthly?.length
    ? (((data.monthly[data.monthly.length - 1]?.closePrice ?? 0) -
        (data.monthly[0]?.closePrice ?? 0)) /
        (data.monthly[0]?.closePrice ?? 1) * 100).toFixed(1)
    : '0'

  const chartData = data?.monthly?.map((m, i) => ({
    month:  m.month,
    price:  m.closePrice,
    signal: m.signal,
    change: m.changePercent,
  })) ?? []

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl"
              style={{ color: 'var(--text-primary)' }}>
            Monthly trend
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            12-month price signals with Grok AI reasoning per month
          </p>
        </div>
        <TickerSearch
          tickers={TICKERS}
          selected={ticker}
          onSelect={t => { setTicker(t); setSelectedMonth(null) }}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Current signal" value={data?.currentSignal || '—'}
                    valueColor={data?.currentSignal === 'BULLISH'
                      ? 'var(--col-bull)'
                      : data?.currentSignal === 'BEARISH'
                      ? 'var(--col-bear)' : 'var(--col-neutral)'}
                    sub="Grok rated" valueSize="text-lg" />
        <MetricCard label="12-month return"
                    value={`${parseFloat(overallReturn) >= 0 ? '+' : ''}${overallReturn}%`}
                    valueColor={parseFloat(overallReturn) >= 0 ? 'var(--col-bull)' : 'var(--col-bear)'}
                    sub="price change" />
        <MetricCard label="Bullish months" value={`${bullishMonths}/${totalMonths}`}
                    sub="out of 12" />
        <MetricCard label="Grok outlook" value={data?.grokOutlook || 'Neutral'}
                    valueSize="text-base" sub="current assessment" />
      </div>

      {/* Chart + month list */}
      <div className="grid md:grid-cols-[1fr_280px] gap-4">

        {/* Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {ticker} — monthly price
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Click a bar to see Grok reasoning
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px]"
                 style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--col-bull)' }} />
                Bullish
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--col-bear)' }} />
                Bearish
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="h-52 flex items-center justify-center"><Spinner /></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                         onClick={({ activeTooltipIndex }) => {
                           if (activeTooltipIndex !== undefined)
                             setSelectedMonth(activeTooltipIndex)
                         }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                       axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                       axisLine={false} tickLine={false}
                       tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `$${v}`} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 8, fontSize: 12,
                    color: 'var(--text-primary)',
                  }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Price']}
                  labelStyle={{ color: 'var(--text-secondary)' }}
                />
                {selectedMonth !== null && (
                  <ReferenceLine x={chartData[selectedMonth]?.month}
                                 stroke="var(--accent)" strokeDasharray="4 4" />
                )}
                <Area type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={2}
                      fill="url(#priceGrad)" dot={(props: any) => {
                        const { cx, cy, index, payload } = props
                        const isSelected = index === selectedMonth
                        const color = payload.signal === 'BULLISH'
                          ? 'var(--col-bull)'
                          : payload.signal === 'BEARISH'
                          ? 'var(--col-bear)'
                          : 'var(--col-neutral)'
                        return (
                          <circle key={cx} cx={cx} cy={cy}
                                  r={isSelected ? 6 : 4}
                                  fill={color}
                                  stroke={isSelected ? 'white' : 'var(--surface-2)'}
                                  strokeWidth={isSelected ? 2 : 1.5}
                                  style={{ cursor: 'pointer' }} />
                        )
                      }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Month list */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 text-xs font-medium uppercase tracking-wider"
               style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
            Month-by-month signals
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
            {(data?.monthly ?? []).map((m, i) => {
              const isSelected = selectedMonth === i
              const chgPos = m.changePercent >= 0
              return (
                <div key={m.month}
                     onClick={() => setSelectedMonth(isSelected ? null : i)}
                     className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                                 ${isSelected ? '' : 'card-hover'}`}
                     style={{
                       background: isSelected ? 'var(--accent-dim)' : 'transparent',
                       borderBottom: '1px solid var(--border-subtle)',
                       borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                     }}>
                  <div className="text-xs w-12 flex-shrink-0 tabular"
                       style={{ color: 'var(--text-secondary)' }}>{m.month}</div>
                  <div className={`tabular text-xs w-14 flex-shrink-0 ${chgPos ? 'text-bull' : 'text-bear'}`}>
                    {chgPos ? '+' : ''}{m.changePercent?.toFixed(1)}%
                  </div>
                  <div className="flex-1">
                    <SignalPill signal={m.signal} size="xs" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grok reasoning for selected month */}
      {displayMonth && (
        <motion.div key={displayMonth.month}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <GrokReasoningCard
            ticker={ticker}
            reasoning={displayMonth.grokReasoning}
            signal={displayMonth.signal}
            confidence={displayMonth.grokConfidence ?? 0}
            month={displayMonth.month}
            showHeader
          />
        </motion.div>
      )}
    </div>
  )
}
