'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, RefreshCw, Search, TrendingUp, TrendingDown, Zap, Clock } from 'lucide-react'
import { useSignalTransitions } from '@/hooks/useSignalTransitions'
import { SignalPill } from '@/components/ui/SignalPill'
import { GrokReasoningCard } from '@/components/dashboard/GrokReasoningCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { ConfidenceBar } from '@/components/ui/ConfidenceBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'

const SECTORS  = ['All sectors', 'Tech', 'Finance', 'Energy', 'Healthcare', 'Consumer', 'Industrial', 'Telecom', 'Real Estate']
const MCAPS    = ['All caps', 'Mega cap', 'Large cap', 'Mid cap']
const DIRS     = ['All', 'Bear → Bull', 'Bull → Bear', 'Trend changes only']

export default function SignalTransitionsPage() {
  const { transitions, isLoading, mutate, lastUpdatedAt } = useSignalTransitions()
  const [dir, setDir]       = useState('All')
  const [sector, setSector] = useState('All sectors')
  const [mcap, setMcap]     = useState('All caps')
  const [query, setQuery]   = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!transitions) return []
    return transitions.filter(t => {
      if (dir === 'Bear → Bull'        && t.currentSignal !== 'BULLISH')      return false
      if (dir === 'Bull → Bear'        && t.currentSignal !== 'BEARISH')      return false
      if (dir === 'Trend changes only' && !t.recentlyTransitioned)            return false
      if (sector !== 'All sectors'     && t.sector !== sector)                return false
      if (mcap !== 'All caps' && !t.marketCap?.toLowerCase().includes(mcap.split(' ')[0].toLowerCase())) return false
      if (query && !t.ticker.toLowerCase().includes(query.toLowerCase()) &&
                   !t.companyName?.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [transitions, dir, sector, mcap, query])

  // Sort: recently transitioned first, then by confidence score desc
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.recentlyTransitioned && !b.recentlyTransitioned) return -1
      if (!a.recentlyTransitioned && b.recentlyTransitioned) return 1
      return b.confidenceScore - a.confidenceScore
    })
  }, [filtered])

  const bullCount   = filtered.filter(t => t.currentSignal === 'BULLISH').length
  const bearCount   = filtered.filter(t => t.currentSignal === 'BEARISH').length
  const trendCount  = filtered.filter(t => t.recentlyTransitioned).length
  const avgConf     = filtered.length
    ? Math.round(filtered.reduce((a, t) => a + t.confidenceScore, 0) / filtered.length)
    : 0

  const minutesAgo  = lastUpdatedAt
    ? Math.floor((Date.now() - lastUpdatedAt.getTime()) / 60000)
    : null

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl"
              style={{ color: 'var(--text-primary)' }}>
            Signal dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            S&P 500 · all current signals — Bear↔Bull trend changes with Grok AI reasoning
          </p>
        </div>
        <div className="flex items-center gap-3">
          {minutesAgo !== null && (
            <span className="flex items-center gap-1.5 text-xs"
                  style={{ color: 'var(--text-muted)' }}>
              <Clock size={11} />
              Updated {minutesAgo === 0 ? 'just now' : `${minutesAgo}m ago`}
            </span>
          )}
          <button onClick={() => mutate()}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}>
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Bullish" value={bullCount} valueColor="var(--col-bull)"
                    sub="current signal" icon={<TrendingUp size={15} />} />
        <MetricCard label="Bearish" value={bearCount} valueColor="var(--col-bear)"
                    sub="current signal" icon={<TrendingDown size={15} />} />
        <MetricCard label="Trend changes" value={trendCount}
                    valueColor="var(--accent)" sub="last 24 hours" />
        <MetricCard label="Avg confidence" value={`${avgConf}%`} sub="Grok signal score" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search ticker…"
            className="pl-8 pr-3 py-1.5 rounded-lg text-sm w-36 outline-none"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        {[
          { opts: DIRS,    val: dir,    set: setDir },
          { opts: SECTORS, val: sector, set: setSector },
          { opts: MCAPS,   val: mcap,   set: setMcap },
        ].map(({ opts, val, set }, i) => (
          <select key={i} value={val} onChange={e => set(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-sm outline-none cursor-pointer"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
          {sorted.length} tickers
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : sorted.length === 0 ? (
        <EmptyState message="No tickers match your filters" />
      ) : (
        <div className="card overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[160px_100px_150px_1fr] gap-4 px-5 py-3 text-xs font-medium uppercase tracking-wider"
               style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span>Stock</span>
            <span>Price</span>
            <span>Signal</span>
            <span>Grok confidence</span>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            <AnimatePresence>
              {sorted.map((t, i) => (
                <motion.div key={t.ticker}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: Math.min(i * 0.02, 0.4) }}>
                  {/* Row */}
                  <div
                    className="px-4 md:px-5 py-4 cursor-pointer card-hover"
                    onClick={() => setExpanded(expanded === t.ticker ? null : t.ticker)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[160px_100px_150px_1fr] gap-3 md:gap-4 items-center">

                      {/* Stock */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium"
                                style={{ color: 'var(--text-primary)' }}>{t.ticker}</span>
                          {t.recentlyTransitioned && (
                            <motion.span
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                            >
                              <Zap size={9} />
                              Trend change
                            </motion.span>
                          )}
                        </div>
                        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {t.companyName}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {t.sector} · {t.marketCap}
                        </div>
                      </div>

                      {/* Price */}
                      <div>
                        <div className="tabular text-sm" style={{ color: 'var(--text-primary)' }}>
                          {t.price > 0 ? `$${t.price?.toFixed(2)}` : '—'}
                        </div>
                        {t.price > 0 && (
                          <div className={`tabular text-xs ${t.priceChangePercent >= 0 ? 'text-bull' : 'text-bear'}`}>
                            {t.priceChangePercent >= 0 ? '+' : ''}{t.priceChangePercent?.toFixed(1)}%
                          </div>
                        )}
                      </div>

                      {/* Signal (with optional transition arrow) */}
                      <div className="flex items-center gap-1.5">
                        {t.recentlyTransitioned && t.previousSignal && t.previousSignal !== t.currentSignal ? (
                          <>
                            <SignalPill signal={t.previousSignal || 'NEUTRAL'} size="sm" />
                            <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                            <SignalPill signal={t.currentSignal} size="sm" />
                          </>
                        ) : (
                          <SignalPill signal={t.currentSignal} size="sm" />
                        )}
                      </div>

                      {/* Confidence */}
                      <div className="flex items-center gap-3">
                        {t.confidenceScore > 0 ? (
                          <>
                            <ConfidenceBar value={t.confidenceScore} signal={t.currentSignal} />
                            <span className="tabular text-xs flex-shrink-0"
                                  style={{ color: 'var(--text-secondary)' }}>
                              {t.confidenceScore}%
                            </span>
                          </>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            No scan yet
                          </span>
                        )}
                        <ChevronIcon expanded={expanded === t.ticker} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Grok reasoning */}
                  <AnimatePresence>
                    {expanded === t.ticker && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="px-4 md:px-5 pb-4">
                          <GrokReasoningCard
                            ticker={t.ticker}
                            reasoning={t.grokReasoning}
                            signal={t.currentSignal}
                            confidence={t.confidenceScore}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <motion.svg animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}
