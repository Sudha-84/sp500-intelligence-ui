'use client'

import useSWR from 'swr'
import axios  from 'axios'

// ── Types ────────────────────────────────────────────────────────────────────

export interface MonthlyPoint {
  month:          string
  closePrice:     number
  changePercent:  number
  signal:         'BULLISH' | 'BEARISH' | 'NEUTRAL'
  grokReasoning?: string
  grokConfidence?: number
}

export interface MonthlyTrendData {
  ticker:        string
  currentSignal: string
  grokOutlook:   string
  monthly:       MonthlyPoint[]
}

export interface WatchlistItem {
  ticker:             string
  companyName:        string
  sector:             string
  marketCap:          string
  currentPrice:       number
  dayChangePercent:   number
  currentSignal:      string
  grokConfidenceScore?: number
  grokReasoning?:     string
  technicalSignals?:  string[]
}

export interface WatchlistSummary {
  watchlistId: string
  name:        string
  itemCount:   number
}

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_MONTHLY: Record<string, MonthlyTrendData> = {
  SPX: {
    ticker: 'SPX', currentSignal: 'BULLISH', grokOutlook: 'Cautious bull',
    monthly: [
      { month:'May 24', closePrice:5069, changePercent:2.4,  signal:'BULLISH', grokReasoning:'Strong employment data and cooling inflation supported risk appetite. Fed signaled patient approach. Grok detected dominant themes of "soft landing" and "rate cut expectations" on financial X.' },
      { month:'Jun 24', closePrice:5460, changePercent:3.5,  signal:'BULLISH', grokReasoning:'AI infrastructure spending commitments from major tech companies drove broad market optimism. Grok flagged record correlation between NVDA price action and SPX sentiment on X.' },
      { month:'Jul 24', closePrice:5522, changePercent:1.1,  signal:'BULLISH', grokReasoning:'Earnings season began strong with 78% beat rate through mid-month. Grok identified "earnings surprise" and "guidance raise" as dominant bullish themes.' },
      { month:'Aug 24', closePrice:5648, changePercent:2.3,  signal:'BULLISH', grokReasoning:'July FOMC minutes confirmed September cut probability rising. Grok detected shift in X language toward "rate cycle turning" and "re-rating opportunity."' },
      { month:'Sep 24', closePrice:5762, changePercent:2.0,  signal:'BULLISH', grokReasoning:'Fed delivered first 50bps cut. Initial volatility resolved into rally. Grok parsed sharp increase in "risk-on" language post-announcement.' },
      { month:'Oct 24', closePrice:5705, changePercent:-1.0, signal:'BEARISH', grokReasoning:'Election uncertainty dominated sentiment. Grok flagged elevated anxiety language on X around policy risk, tariffs, and geopolitical flashpoints. VIX spiked to 23.' },
      { month:'Nov 24', closePrice:5870, changePercent:2.9,  signal:'BULLISH', grokReasoning:'Post-election clarity drove relief rally. Grok detected rapid shift from uncertainty to "policy clarity" and "deregulation tailwind" themes.' },
      { month:'Dec 24', closePrice:5881, changePercent:0.2,  signal:'BEARISH', grokReasoning:'Fed turned hawkish at December meeting, signaling fewer cuts in 2025. Grok identified spike in "higher for longer" and "valuation concern" posts.' },
      { month:'Jan 25', closePrice:5996, changePercent:1.9,  signal:'BULLISH', grokReasoning:'January effect and new-year institutional deployment. Grok found bullish sentiment reset. Strong retail sales data surprised to the upside.' },
      { month:'Feb 25', closePrice:5954, changePercent:-0.7, signal:'BEARISH', grokReasoning:'Tariff escalation fears returned. Grok detected elevated "trade war" and "margin pressure" language on X. ISM manufacturing printed below 50.' },
      { month:'Mar 25', closePrice:5611, changePercent:-5.8, signal:'BEARISH', grokReasoning:'Largest monthly drawdown in 18 months. Grok found dominant themes of "recession risk" and "geopolitical escalation." Credit spreads widened.' },
      { month:'Apr 25', closePrice:5248, changePercent:1.4,  signal:'BULLISH', grokReasoning:'Recovery rally following oversold conditions. Grok detected sentiment reversal with "buy the dip" and "Fed put" re-emerging. Q1 earnings beating expectations.' },
    ],
  },
}

// ── useMonthlyTrend ──────────────────────────────────────────────────────────

async function fetchMonthly(url: string) {
  try {
    const res = await axios.get(url)
    return res.data?.data
  } catch {
    return null
  }
}

export function useMonthlyTrend(ticker: string) {
  const { data, isLoading, error } = useSWR<MonthlyTrendData>(
    `/api/sentiment/${ticker}/monthly`,
    fetchMonthly,
    { refreshInterval: 60 * 60 * 1000 }
  )

  return {
    data: data ?? MOCK_MONTHLY[ticker] ?? MOCK_MONTHLY['SPX'],
    isLoading,
    error,
  }
}

// ── useWatchlist ─────────────────────────────────────────────────────────────

const MOCK_WATCHLISTS: WatchlistSummary[] = [
  { watchlistId: 'wl-1', name: 'My main watchlist', itemCount: 6 },
  { watchlistId: 'wl-2', name: 'Tech picks',        itemCount: 4 },
]

const MOCK_ITEMS: WatchlistItem[] = [
  { ticker:'NVDA', companyName:'Nvidia Corp',    sector:'Tech',     marketCap:'Mega',  currentPrice:875.30, dayChangePercent:4.7,  currentSignal:'BULLISH', grokConfidenceScore:92, grokReasoning:'Grok analysis of 34k X posts over 7 days shows overwhelming bullish consensus driven by Blackwell GPU allocation news and hyperscaler capex commitment language. Three institutional upgrades this week with price target increases averaging +18%.', technicalSignals:['RSI 68 (rising)','MACD +ve crossover','Volume +340% vs avg','Analyst upgrades: 3'] },
  { ticker:'AAPL', companyName:'Apple Inc',      sector:'Tech',     marketCap:'Mega',  currentPrice:189.42, dayChangePercent:1.2,  currentSignal:'BULLISH', grokConfidenceScore:76, grokReasoning:'Grok parsed iPhone 17 production ramp speculation dominating X conversations. Services revenue growth narrative strengthening. India manufacturing expansion reducing China concentration risk.', technicalSignals:['RSI 58 (neutral)','50d MA support held','Services rev +12% YoY','Buyback $90B active'] },
  { ticker:'TSLA', companyName:'Tesla Inc',      sector:'Consumer', marketCap:'Large', currentPrice:172.10, dayChangePercent:-2.1, currentSignal:'BEARISH', grokConfidenceScore:85, grokReasoning:'Grok sentiment model returned a net bearish score of -0.42 for TSLA this week. X discourse dominated by Q1 delivery miss fallout, margin compression concerns, and competitive pressure from BYD.', technicalSignals:['RSI 34 (oversold)','Death cross forming','Delivery miss -13%','Short interest rising'] },
  { ticker:'META', companyName:'Meta Platforms', sector:'Tech',     marketCap:'Mega',  currentPrice:502.80, dayChangePercent:2.3,  currentSignal:'BULLISH', grokConfidenceScore:88, grokReasoning:'Grok identified Threads monetization news and Llama 4 benchmarks as the two dominant bullish catalysts driving X sentiment this week. Ad revenue diversification narrative resonating with institutional accounts.', technicalSignals:['RSI 62 (rising)','Revenue est raised x4','Llama 4 positive buzz','Put/Call ratio: 0.7'] },
  { ticker:'AMZN', companyName:'Amazon.com',     sector:'Consumer', marketCap:'Mega',  currentPrice:184.50, dayChangePercent:1.9,  currentSignal:'BULLISH', grokConfidenceScore:81, grokReasoning:'AWS AI infrastructure announcements driving the strongest sustained bullish narrative Grok has detected for AMZN since the 2023 recovery. X post sentiment score at +0.61.', technicalSignals:['RSI 60','AWS growth reaccelerating','Prime intl expanding','Ad rev +18% YoY'] },
  { ticker:'GOOGL', companyName:'Alphabet Inc',  sector:'Tech',     marketCap:'Mega',  currentPrice:162.30, dayChangePercent:0.3,  currentSignal:'NEUTRAL', grokConfidenceScore:63, grokReasoning:'Grok found mixed signals — AI search integration receiving positive feedback on X but antitrust ruling risk generating offsetting bearish language. Net sentiment score near zero at +0.08.', technicalSignals:['RSI 52 (neutral)','Antitrust risk elevated','YouTube ad stable','Confidence: 63%'] },
]

export function useWatchlist() {
  const [activeId, setActiveId] = useState('wl-1')

  const { data: watchlists, mutate: mutateWatchlists } = useSWR<WatchlistSummary[]>(
    '/api/watchlists',
    async (url: string) => {
      try { return (await axios.get(url)).data?.data ?? MOCK_WATCHLISTS }
      catch { return MOCK_WATCHLISTS }
    }
  )

  const { data: detail, isLoading, mutate } = useSWR<{ items: WatchlistItem[] }>(
    activeId ? `/api/watchlists/${activeId}` : null,
    async (url: string) => {
      try { return (await axios.get(url)).data?.data }
      catch { return { items: MOCK_ITEMS } }
    },
    { refreshInterval: 15 * 60 * 1000 }
  )

  async function syncFromBarchart() {
    try {
      await axios.post(`/api/watchlists/${activeId}/sync`, {
        barchartId: 'default',
      })
      mutate()
    } catch {}
  }

  async function removeItem(ticker: string) {
    try {
      await axios.delete(`/api/watchlists/${activeId}/items/${ticker}`)
      mutate()
    } catch {}
  }

  return {
    watchlists:           watchlists ?? MOCK_WATCHLISTS,
    activeWatchlist:      watchlists?.find(w => w.watchlistId === activeId),
    setActiveWatchlistId: setActiveId,
    items:                detail?.items ?? MOCK_ITEMS,
    isLoading,
    mutate,
    syncFromBarchart,
    removeItem,
  }
}

// useState import needed for useWatchlist
import { useState } from 'react'
