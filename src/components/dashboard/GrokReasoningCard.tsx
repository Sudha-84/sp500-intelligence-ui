'use client'

import { motion } from 'framer-motion'
import { Sparkles, Brain, TrendingUp, Hash } from 'lucide-react'
import { SignalPill } from '@/components/ui/SignalPill'

interface Props {
  ticker:     string
  reasoning?: string
  signal:     string
  confidence: number
  month?:     string
  signals?:   string[]
  showHeader?: boolean
}

export function GrokReasoningCard({
  ticker, reasoning, signal, confidence, month, signals, showHeader
}: Props) {
  const bigrams = signals?.slice(0, 5) ?? []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl p-4 space-y-3"
      style={{
        background: 'var(--surface-3)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Brain size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Grok reasoning — {ticker} {month && `· ${month}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SignalPill signal={signal} />
            <span className="text-xs px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              {confidence}% confidence
            </span>
          </div>
        </div>
      )}

      {/* xAI badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
             style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
          <Sparkles size={11} />
          xAI · Grok analysis
        </div>
        {!showHeader && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Based on X post sentiment around {ticker}
          </span>
        )}
      </div>

      {/* Reasoning text */}
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {reasoning || (
          <span style={{ color: 'var(--text-muted)' }}>
            Grok reasoning will appear here after the next signal scan.
            Analysis is generated from X post sentiment patterns and technical indicators.
          </span>
        )}
      </p>

      {/* Signal chips */}
      {bigrams.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Hash size={11} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          {bigrams.map(sig => (
            <span key={sig}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--surface-4)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                  }}>
              {sig}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
