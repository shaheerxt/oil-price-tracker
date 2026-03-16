import { NextResponse } from 'next/server';

// Cache for 5 minutes (300 seconds)
export const revalidate = 300;

async function fetchFromYahooFinance() {
  const symbols = [
    { symbol: 'BZ=F', name: 'Brent Crude' },
    { symbol: 'CL=F', name: 'WTI Crude' },
  ];

  const results = {};

  for (const { symbol, name } of symbols) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=6y&interval=1mo`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 300 },
      });

      if (!res.ok) continue;

      const data = await res.json();
      const chart = data?.chart?.result?.[0];
      if (!chart) continue;

      const timestamps = chart.timestamp || [];
      const closes = chart.indicators?.quote?.[0]?.close || [];

      const monthly = timestamps.map((ts, i) => {
        const date = new Date(ts * 1000);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return { date: month, price: closes[i] ? Math.round(closes[i] * 100) / 100 : null };
      }).filter(d => d.price !== null);

      results[symbol] = {
        name,
        symbol,
        current: closes[closes.length - 1] ? Math.round(closes[closes.length - 1] * 100) / 100 : null,
        monthly,
      };
    } catch (e) {
      console.error(`Failed to fetch ${symbol}:`, e.message);
    }
  }

  return results;
}

// Fallback data if Yahoo Finance is unavailable
function getFallbackData() {
  return {
    'BZ=F': { name: 'Brent Crude', symbol: 'BZ=F', current: 101.02, monthly: null, fallback: true },
    'CL=F': { name: 'WTI Crude', symbol: 'CL=F', current: 94.11, monthly: null, fallback: true },
  };
}

export async function GET() {
  try {
    const data = await fetchFromYahooFinance();

    if (Object.keys(data).length === 0) {
      return NextResponse.json({
        ...getFallbackData(),
        _meta: { source: 'fallback', timestamp: new Date().toISOString() },
      });
    }

    return NextResponse.json({
      ...data,
      _meta: { source: 'yahoo_finance', timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json({
      ...getFallbackData(),
      _meta: { source: 'fallback', error: error.message, timestamp: new Date().toISOString() },
    });
  }
}
