'use client'

import useSWR from 'swr'
import axios  from 'axios'

export interface SignalTransition {
  ticker:             string
  companyName:        string
  sector:             string
  marketCap:          string
  price:              number
  priceChangePercent: number
  previousSignal:     string
  currentSignal:      string
  confidenceScore:    number
  grokReasoning?:     string
  grokReasoningId?:   string
  recentlyTransitioned: boolean
  detectedAt:         string
}

interface SentimentTransition {
  ticker:               string
  reasoning:            string
  preSentimentSummary?: string
  postSentimentSummary?: string
  keyBigrams?:          string
  confidenceScore:      number
  generatedAt:          string
}

// ── Extended mock — 20 tickers across sectors ───────────────────────────────

const MOCK: SignalTransition[] = [
  { ticker:'NVDA',  companyName:'Nvidia Corp',          sector:'Tech',       marketCap:'mega',  price:875.30, priceChangePercent:4.7,  previousSignal:'BEARISH', currentSignal:'BULLISH', confidenceScore:92, recentlyTransitioned:true,  grokReasoning:'X post volume surged 340% this week with dominant themes around Blackwell chip allocation and hyperscaler capex commitments. Grok detected a shift from "supply concern" to "demand certainty" language. RSI crossed 55 from below; MACD histogram turned positive for the first time in 6 weeks.', detectedAt: new Date().toISOString() },
  { ticker:'AMD',   companyName:'Adv Micro Devices',    sector:'Tech',       marketCap:'large', price:162.30, priceChangePercent:3.2,  previousSignal:'BEARISH', currentSignal:'BULLISH', confidenceScore:88, recentlyTransitioned:true,  grokReasoning:'Data center GPU alternative narrative accelerating on X. MI300X benchmark posts surging. Grok found strong co-occurrence of "AMD," "hyperscaler," and "diversification" — a pattern historically preceding institutional accumulation.', detectedAt: new Date().toISOString() },
  { ticker:'MSFT',  companyName:'Microsoft Corp',        sector:'Tech',       marketCap:'mega',  price:416.00, priceChangePercent:2.1,  previousSignal:'BEARISH', currentSignal:'BULLISH', confidenceScore:89, recentlyTransitioned:true,  grokReasoning:'Copilot enterprise seat growth beating internal estimates per X leaks and analyst channel checks. Grok found "Copilot adoption," "enterprise AI," and "Office 365 upsell" as top bullish bigrams.', detectedAt: new Date().toISOString() },
  { ticker:'TSLA',  companyName:'Tesla Inc',             sector:'Consumer',   marketCap:'large', price:172.10, priceChangePercent:-2.1, previousSignal:'BULLISH', currentSignal:'BEARISH', confidenceScore:85, recentlyTransitioned:true,  grokReasoning:'Post-Q1 delivery miss sentiment on X turned sharply negative. Grok identified rising bigrams: "margin compression," "China EV war," "Musk distraction." Institutional flow shows 3 consecutive days of net outflows.', detectedAt: new Date().toISOString() },
  { ticker:'XOM',   companyName:'ExxonMobil',            sector:'Energy',     marketCap:'large', price:113.00, priceChangePercent:-1.4, previousSignal:'BULLISH', currentSignal:'BEARISH', confidenceScore:71, recentlyTransitioned:true,  grokReasoning:'OPEC+ production increase announcement triggered bearish pivot on energy X posts. Grok detected 60% drop in bullish framing within 24 hours. WTI futures curve in contango.', detectedAt: new Date().toISOString() },
  { ticker:'AMZN',  companyName:'Amazon.com',            sector:'Consumer',   marketCap:'mega',  price:185.00, priceChangePercent:1.9,  previousSignal:'BEARISH', currentSignal:'BULLISH', confidenceScore:81, recentlyTransitioned:true,  grokReasoning:'AWS re:Invent product announcements driving renewed bullish momentum. Grok parsed 18k posts identifying "AI infrastructure," "Prime growth," and "AWS margin expansion" as dominant themes.', detectedAt: new Date().toISOString() },
  { ticker:'JPM',   companyName:'JPMorgan Chase',        sector:'Finance',    marketCap:'mega',  price:198.40, priceChangePercent:2.8,  previousSignal:'BEARISH', currentSignal:'BULLISH', confidenceScore:78, recentlyTransitioned:true,  grokReasoning:'Fed pause narrative dominating finance X posts. Grok flagged increased buy-side language around JPM NII guidance upgrade.', detectedAt: new Date().toISOString() },
  { ticker:'BAC',   companyName:'Bank of America',       sector:'Finance',    marketCap:'large', price:37.00,  priceChangePercent:-1.8, previousSignal:'BULLISH', currentSignal:'BEARISH', confidenceScore:74, recentlyTransitioned:true,  grokReasoning:'Commercial real estate exposure concerns resurfacing in financial press and X discourse. Grok identified "CRE losses," "deposit outflows," and "rate sensitivity" as trending negative topics.', detectedAt: new Date().toISOString() },
  { ticker:'PFE',   companyName:'Pfizer',                sector:'Healthcare', marketCap:'large', price:28.40,  priceChangePercent:-0.9, previousSignal:'BULLISH', currentSignal:'BEARISH', confidenceScore:67, recentlyTransitioned:true,  grokReasoning:'Pipeline disappointment on oncology trial data combined with ongoing revenue normalization post-COVID. Grok confidence lower due to conflicting signals — some posts anticipating a buyback announcement.', detectedAt: new Date().toISOString() },
  { ticker:'AAPL',  companyName:'Apple Inc',             sector:'Tech',       marketCap:'mega',  price:189.42, priceChangePercent:1.2,  previousSignal:'NEUTRAL', currentSignal:'BULLISH', confidenceScore:76, recentlyTransitioned:false, grokReasoning:'iPhone 17 production ramp speculation dominating X conversations. Services revenue growth narrative strengthening. India manufacturing expansion reducing China concentration risk.', detectedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { ticker:'META',  companyName:'Meta Platforms',        sector:'Tech',       marketCap:'mega',  price:502.80, priceChangePercent:2.3,  previousSignal:'NEUTRAL', currentSignal:'BULLISH', confidenceScore:88, recentlyTransitioned:false, grokReasoning:'Threads monetization news and Llama 4 benchmarks as dominant bullish catalysts. Ad revenue diversification narrative resonating with institutional accounts.', detectedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { ticker:'GOOGL', companyName:'Alphabet Inc',          sector:'Tech',       marketCap:'mega',  price:162.30, priceChangePercent:0.3,  previousSignal:'NEUTRAL', currentSignal:'NEUTRAL',  confidenceScore:63, recentlyTransitioned:false, grokReasoning:'Mixed signals — AI search integration positive feedback but antitrust ruling risk generating offsetting bearish language. Net sentiment score near zero.', detectedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { ticker:'NFLX',  companyName:'Netflix Inc',           sector:'Tech',       marketCap:'large', price:624.90, priceChangePercent:1.8,  previousSignal:'NEUTRAL', currentSignal:'BULLISH', confidenceScore:79, recentlyTransitioned:false, grokReasoning:'Password sharing crackdown monetization continues to beat expectations. Grok found sustained bullish X language around subscriber growth milestones.', detectedAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { ticker:'UNH',   companyName:'UnitedHealth Group',    sector:'Healthcare', marketCap:'mega',  price:512.30, priceChangePercent:-1.1, previousSignal:'BULLISH', currentSignal:'BEARISH', confidenceScore:72, recentlyTransitioned:false, grokReasoning:'Rising medical cost ratios flagged in analyst notes. Grok detected increasing "MLR pressure" and "Medicare Advantage headwinds" language on X.', detectedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { ticker:'LLY',   companyName:'Eli Lilly',             sector:'Healthcare', marketCap:'mega',  price:742.10, priceChangePercent:3.4,  previousSignal:'NEUTRAL', currentSignal:'BULLISH', confidenceScore:91, recentlyTransitioned:false, grokReasoning:'GLP-1 supply expansion announcements driving sustained bullish momentum. Grok found record X post volume for "Mounjaro" and "Zepbound" alongside institutional upgrade language.', detectedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { ticker:'GS',    companyName:'Goldman Sachs',         sector:'Finance',    marketCap:'large', price:430.20, priceChangePercent:1.5,  previousSignal:'NEUTRAL', currentSignal:'BULLISH', confidenceScore:75, recentlyTransitioned:false, grokReasoning:'Investment banking revival narrative dominant on X. Grok flagged M&A pipeline commentary from sell-side analysts citing deal activity recovery.', detectedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { ticker:'CVX',   companyName:'Chevron Corp',          sector:'Energy',     marketCap:'mega',  price:151.80, priceChangePercent:-0.8, previousSignal:'BULLISH', currentSignal:'NEUTRAL',  confidenceScore:54, recentlyTransitioned:false, grokReasoning:'Mixed energy signals — crude demand steady but OPEC uncertainty capping upside. RSI mid-range at 51, no strong directional bias in X discourse.', detectedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { ticker:'CAT',   companyName:'Caterpillar Inc',       sector:'Industrial', marketCap:'large', price:338.50, priceChangePercent:0.9,  previousSignal:'NEUTRAL', currentSignal:'BULLISH', confidenceScore:70, recentlyTransitioned:false, grokReasoning:'Infrastructure spending cycle and mining capex language bullish on X. Grok found elevated mentions of "construction equipment backlog" and "international order intake."', detectedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { ticker:'WMT',   companyName:'Walmart Inc',           sector:'Consumer',   marketCap:'mega',  price:68.20,  priceChangePercent:0.6,  previousSignal:'NEUTRAL', currentSignal:'BULLISH', confidenceScore:68, recentlyTransitioned:false, grokReasoning:'E-commerce acceleration and grocery share gains narrative positive. Grok detected increasing "value consumer" and "trade-down beneficiary" themes on X.', detectedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { ticker:'DIS',   companyName:'Walt Disney Co',        sector:'Consumer',   marketCap:'large', price:105.40, priceChangePercent:-1.2, previousSignal:'BULLISH', currentSignal:'BEARISH', confidenceScore:66, recentlyTransitioned:false, grokReasoning:'Streaming profitability timeline doubts resurfacing. Grok found elevated "cord-cutting" and "ESPN uncertainty" language offsetting theme-park optimism.', detectedAt: new Date(Date.now() - 86400000 * 4).toISOString() },
]

// ── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchCurrentState(url: string): Promise<SignalTransition[] | null> {
  try {
    const res = await axios.get(url)
    return res.data?.data ?? null
  } catch {
    return null
  }
}

async function fetchSentiments(url: string): Promise<SentimentTransition[] | null> {
  try {
    const res = await axios.get(url)
    return res.data?.data ?? null
  } catch {
    return null
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSignalTransitions() {
  const { data: rawStates, error, isLoading, mutate } = useSWR<SignalTransition[] | null>(
    '/api/signals/current-state',
    fetchCurrentState,
    { refreshInterval: 30 * 60 * 1000 }   // 30-min — matches price collection cadence
  )

  const { data: sentiments } = useSWR<SentimentTransition[] | null>(
    '/api/sentiment/transitions',
    fetchSentiments,
    { refreshInterval: 30 * 60 * 1000 }
  )

  // Merge Grok reasoning from sentiment service into each transition
  const transitions: SignalTransition[] = (() => {
    const base = rawStates ?? MOCK
    if (!sentiments) return base
    const sentMap = new Map(sentiments.map(s => [s.ticker, s]))
    return base.map(t => {
      const s = sentMap.get(t.ticker)
      if (!s) return t
      return { ...t, grokReasoning: s.reasoning }
    })
  })()

  return {
    transitions,
    isLoading,
    error,
    mutate,
    lastUpdatedAt: new Date(),
  }
}
