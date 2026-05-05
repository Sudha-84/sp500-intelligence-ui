'use client'

import useSWR from 'swr'
import axios  from 'axios'

export interface SignalTransition {
  ticker:            string
  companyName:       string
  sector:            string
  marketCap:         string
  price:             number
  priceChangePercent: number
  previousSignal:    string
  currentSignal:     string
  confidenceScore:   number
  grokReasoning?:   string
  detectedAt:        string
}

const MOCK: SignalTransition[] = [
  { ticker:'NVDA', companyName:'Nvidia Corp',       sector:'Tech',     marketCap:'mega',  price:875.30, priceChangePercent:4.7,  previousSignal:'BEARISH', currentSignal:'BULLISH', confidenceScore:92, grokReasoning:'X post volume surged 340% this week with dominant themes around Blackwell chip allocation and hyperscaler capex commitments. Grok detected a shift from "supply concern" to "demand certainty" language. RSI crossed 55 from below; MACD histogram turned positive for the first time in 6 weeks.', detectedAt: new Date().toISOString() },
  { ticker:'AMD',  companyName:'Adv Micro Devices', sector:'Tech',     marketCap:'large', price:162.30, priceChangePercent:3.2,  previousSignal:'BEARISH', currentSignal:'BULLISH', confidenceScore:88, grokReasoning:'Data center GPU alternative narrative accelerating on X. MI300X benchmark posts surging. Grok found strong co-occurrence of "AMD," "hyperscaler," and "diversification" — a pattern historically preceding institutional accumulation.', detectedAt: new Date().toISOString() },
  { ticker:'MSFT', companyName:'Microsoft Corp',    sector:'Tech',     marketCap:'mega',  price:416.00, priceChangePercent:2.1,  previousSignal:'BEARISH', currentSignal:'BULLISH', confidenceScore:89, grokReasoning:'Copilot enterprise seat growth beating internal estimates per X leaks and analyst channel checks. Grok found "Copilot adoption," "enterprise AI," and "Office 365 upsell" as top bullish bigrams. GitHub Copilot now the most-mentioned enterprise AI tool on X.', detectedAt: new Date().toISOString() },
  { ticker:'TSLA', companyName:'Tesla Inc',         sector:'Consumer', marketCap:'large', price:172.10, priceChangePercent:-2.1, previousSignal:'BULLISH', currentSignal:'BEARISH', confidenceScore:85, grokReasoning:'Post-Q1 delivery miss sentiment on X turned sharply negative. Grok identified rising bigrams: "margin compression," "China EV war," "Musk distraction." Institutional flow shows 3 consecutive days of net outflows. 50-day MA crossed below 200-day MA.', detectedAt: new Date().toISOString() },
  { ticker:'XOM',  companyName:'ExxonMobil',        sector:'Energy',   marketCap:'large', price:113.00, priceChangePercent:-1.4, previousSignal:'BULLISH', currentSignal:'BEARISH', confidenceScore:71, grokReasoning:'OPEC+ production increase announcement triggered bearish pivot on energy X posts. Grok detected 60% drop in bullish framing within 24 hours. WTI futures curve in contango. Confidence moderate due to mixed geopolitical signals.', detectedAt: new Date().toISOString() },
  { ticker:'AMZN', companyName:'Amazon.com',        sector:'Consumer', marketCap:'mega',  price:185.00, priceChangePercent:1.9,  previousSignal:'BEARISH', currentSignal:'BULLISH', confidenceScore:81, grokReasoning:'AWS re:Invent product announcements driving renewed bullish momentum. Grok parsed 18k posts identifying "AI infrastructure," "Prime growth," and "AWS margin expansion" as dominant themes. Analyst upgrades outnumber downgrades 4:1 this month.', detectedAt: new Date().toISOString() },
  { ticker:'JPM',  companyName:'JPMorgan Chase',    sector:'Finance',  marketCap:'mega',  price:198.40, priceChangePercent:2.8,  previousSignal:'BEARISH', currentSignal:'BULLISH', confidenceScore:78, grokReasoning:'Fed pause narrative dominating finance X posts. Grok flagged increased buy-side language around JPM NII guidance upgrade. Credit quality commentary improved vs prior quarter.', detectedAt: new Date().toISOString() },
  { ticker:'BAC',  companyName:'Bank of America',   sector:'Finance',  marketCap:'large', price:37.00,  priceChangePercent:-1.8, previousSignal:'BULLISH', currentSignal:'BEARISH', confidenceScore:74, grokReasoning:'Commercial real estate exposure concerns resurfacing in financial press and X discourse. Grok identified "CRE losses," "deposit outflows," and "rate sensitivity" as trending negative topics.', detectedAt: new Date().toISOString() },
  { ticker:'PFE',  companyName:'Pfizer',            sector:'Healthcare',marketCap:'large', price:28.40,  priceChangePercent:-0.9, previousSignal:'BULLISH', currentSignal:'BEARISH', confidenceScore:67, grokReasoning:'Pipeline disappointment on oncology trial data combined with ongoing revenue normalization post-COVID. Grok confidence lower due to conflicting signals — some posts anticipating a buyback announcement.', detectedAt: new Date().toISOString() },
]

async function fetcher(url: string) {
  try {
    const res = await axios.get(url)
    return res.data?.data ?? MOCK
  } catch {
    return MOCK
  }
}

export function useSignalTransitions() {
  const { data, error, isLoading, mutate } = useSWR<SignalTransition[]>(
    '/api/signals/transitions',
    fetcher,
    { refreshInterval: 15 * 60 * 1000 }   // Re-fetch every 15 min
  )

  return {
    transitions: data ?? MOCK,
    isLoading,
    error,
    mutate,
  }
}
