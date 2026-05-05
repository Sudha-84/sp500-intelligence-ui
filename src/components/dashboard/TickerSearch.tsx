'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Ticker { sym: string; name: string }
interface Props  { tickers: Ticker[]; selected: string; onSelect: (sym: string) => void }

export function TickerSearch({ tickers, selected, onSelect }: Props) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const filtered = tickers.filter(t =>
    t.sym.toLowerCase().includes(query.toLowerCase()) ||
    t.name.toLowerCase().includes(query.toLowerCase())
  )
  const current = tickers.find(t => t.sym === selected)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
      >
        <span className="font-mono font-medium">{selected}</span>
        <span className="text-xs hidden sm:inline"
              style={{ color: 'var(--text-muted)' }}>
          {current?.name}
        </span>
        <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-64 z-50 rounded-xl overflow-hidden"
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            }}
          >
            {/* Search */}
            <div className="p-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }} />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search ticker or name…"
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs outline-none"
                  style={{
                    background: 'var(--surface-4)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
              {filtered.map(t => (
                <button
                  key={t.sym}
                  onClick={() => { onSelect(t.sym); setQuery(''); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left
                             transition-colors hover:bg-opacity-50"
                  style={{
                    background: t.sym === selected ? 'var(--accent-dim)' : 'transparent',
                    color: t.sym === selected ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                >
                  <span className="font-mono text-sm font-medium w-12 flex-shrink-0">{t.sym}</span>
                  <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {t.name}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-xs text-center"
                     style={{ color: 'var(--text-muted)' }}>
                  No results
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
