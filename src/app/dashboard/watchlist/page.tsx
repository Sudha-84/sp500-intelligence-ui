'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Plus, Link2, ChevronDown, Trash2, Filter } from 'lucide-react'
import { useWatchlist } from '@/hooks/useWatchlist'
import { SignalPill } from '@/components/ui/SignalPill'
import { GrokReasoningCard } from '@/components/dashboard/GrokReasoningCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { ConfidenceBar } from '@/components/ui/ConfidenceBar'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

const SIGNAL_FILTERS = ['All', 'Bullish', 'Bearish', 'Neutral']

export default function WatchlistPage() {
  const { watchlists, activeWatchlist, setActiveWatchlistId, items,
          isLoading, syncFromBarchart, removeItem, mutate } = useWatchlist()
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [sigFilter, setSigFilter] = useState('All')
  const [syncing, setSyncing]     = useState(false)

  const filtered = (items ?? []).filter(item => {
    if (sigFilter === 'All') return true
    return item.currentSignal?.toLowerCase() === sigFilter.toLowerCase()
  })

  const bullCount    = items?.filter(i => i.currentSignal === 'BULLISH').length ?? 0
  const bearCount    = items?.filter(i => i.currentSignal === 'BEARISH').length ?? 0
  const avgConf      = items?.length
    ? Math.round(items.reduce((a, i) => a + (i.grokConfidenceScore ?? 0), 0) / items.length)
    : 0

  async function handleSync() {
    setSyncing(true)
    try { await syncFromBarchart() }
    finally { setSyncing(false) }
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl"
              style={{ color: 'var(--text-primary)' }}>
            Watchlist
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Synced from Barchart Premier · Grok AI reasoning per stock
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Watchlist selector */}
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm outline-none cursor-pointer"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              onChange={e => setActiveWatchlistId(e.target.value)}
            >
              {watchlists?.map(wl => (
                <option key={wl.watchlistId} value={wl.watchlistId}>{wl.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                         style={{ color: 'var(--text-muted)' }} />
          </div>

          <button onClick={handleSync}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}>
            <Link2 size={14} />
            <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Sync Barchart'}</span>
          </button>

          <button onClick={() => mutate()}
                  className="p-2 rounded-lg"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}>
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total stocks"   value={items?.length ?? 0} sub="in watchlist" />
        <MetricCard label="Bullish signals" value={bullCount}
                    valueColor="var(--col-bull)" sub="Grok rated" />
        <MetricCard label="Bearish signals" value={bearCount}
                    valueColor="var(--col-bear)" sub="Grok rated" />
        <MetricCard label="Avg confidence" value={`${avgConf}%`} sub="across watchlist" />
      </div>

      {/* Signal filter */}
      <div className="flex gap-2 items-center flex-wrap">
        <Filter size={13} style={{ color: 'var(--text-muted)' }} />
        {SIGNAL_FILTERS.map(f => (
          <button key={f} onClick={() => setSigFilter(f)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: sigFilter === f ? 'var(--accent-dim)' : 'var(--surface-2)',
                    color: sigFilter === f ? 'var(--accent)' : 'var(--text-secondary)',
                    border: `1px solid ${sigFilter === f ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  }}>
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} stocks
        </span>
      </div>

      {/* Watchlist cards */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message={items?.length === 0
            ? "No stocks in this watchlist yet. Sync from Barchart Premier to get started."
            : "No stocks match the selected signal filter."}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div key={item.ticker}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ delay: i * 0.04 }}
                          className="card card-hover overflow-hidden">

                {/* Card header */}
                <div
                  className="px-5 py-4 cursor-pointer"
                  onClick={() => setExpanded(expanded === item.ticker ? null : item.ticker)}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: ticker info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-base font-semibold"
                              style={{ color: 'var(--text-primary)' }}>
                          {item.ticker}
                        </span>
                        <SignalPill signal={item.currentSignal || 'NEUTRAL'} />
                        <span className="text-xs px-2 py-0.5 rounded-md"
                              style={{
                                background: 'var(--surface-3)',
                                color: 'var(--text-muted)',
                              }}>
                          {item.sector} · {item.marketCap}
                        </span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {item.companyName}
                      </div>
                    </div>

                    {/* Right: price + actions */}
                    <div className="flex items-start gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="tabular text-sm font-medium"
                             style={{ color: 'var(--text-primary)' }}>
                          ${item.currentPrice?.toFixed(2)}
                        </div>
                        <div className={`tabular text-xs ${item.dayChangePercent >= 0 ? 'text-bull' : 'text-bear'}`}>
                          {item.dayChangePercent >= 0 ? '+' : ''}{item.dayChangePercent?.toFixed(1)}%
                        </div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); removeItem(item.ticker) }}
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: 'var(--text-muted)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Confidence + Grok tag */}
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs px-2 py-0.5 rounded-md"
                          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                      xAI Grok · {item.grokConfidenceScore}% confidence
                    </span>
                    <ConfidenceBar value={item.grokConfidenceScore ?? 0}
                                   signal={item.currentSignal} className="flex-1 max-w-32" />
                    <motion.svg animate={{ rotate: expanded === item.ticker ? 180 : 0 }}
                                width="14" height="14" viewBox="0 0 24 24" fill="none"
                                style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  </div>
                </div>

                {/* Expanded Grok reasoning */}
                <AnimatePresence>
                  {expanded === item.ticker && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}
                                exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                      <div className="px-5 pb-5 pt-0">
                        <GrokReasoningCard
                          ticker={item.ticker}
                          reasoning={item.grokReasoning}
                          signal={item.currentSignal}
                          confidence={item.grokConfidenceScore ?? 0}
                          signals={item.technicalSignals}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
