'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { historicalOilPrices, warEvents, warZones, gasolinePrices } from '../lib/static-data';
import NewsTicker from './components/NewsTicker';
import OilChart from './components/OilChart';
import GasolineChart from './components/GasolineChart';
import Timeline from './components/Timeline';
import KpiRow from './components/KpiRow';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  const [oilData, setOilData] = useState(historicalOilPrices);
  const [news, setNews] = useState([]);
  const [livePrices, setLivePrices] = useState({ brent: null, wti: null });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState('static');

  // Fetch live oil prices
  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/oil-prices');
      const data = await res.json();

      if (data._meta?.source !== 'fallback') {
        const brentData = data['BZ=F'];
        const wtiData = data['CL=F'];

        if (brentData?.monthly && wtiData?.monthly) {
          // Merge live monthly data with static fallback
          const brentMap = {};
          brentData.monthly.forEach(d => { brentMap[d.date] = d.price; });
          const wtiMap = {};
          wtiData.monthly.forEach(d => { wtiMap[d.date] = d.price; });

          const merged = historicalOilPrices.map(d => ({
            ...d,
            brent: brentMap[d.date] || d.brent,
            wti: wtiMap[d.date] || d.wti,
          }));

          // Add any new months from live data
          const existingDates = new Set(merged.map(d => d.date));
          brentData.monthly.forEach(d => {
            if (!existingDates.has(d.date)) {
              merged.push({ date: d.date, brent: d.price, wti: wtiMap[d.date] || d.price * 0.93 });
            }
          });

          merged.sort((a, b) => a.date.localeCompare(b.date));
          setOilData(merged);
          setDataSource('live');
        }

        setLivePrices({
          brent: brentData?.current || null,
          wti: wtiData?.current || null,
        });
      }

      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to fetch live prices:', e);
    }
  }, []);

  // Fetch news
  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.articles) {
        setNews(data.articles);
      }
    } catch (e) {
      console.error('Failed to fetch news:', e);
    }
  }, []);

  // Initial fetch + 5-min interval
  useEffect(() => {
    fetchPrices();
    fetchNews();

    const priceInterval = setInterval(fetchPrices, 5 * 60 * 1000);
    const newsInterval = setInterval(fetchNews, 5 * 60 * 1000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(newsInterval);
    };
  }, [fetchPrices, fetchNews]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-divider)] bg-[var(--color-bg)] backdrop-blur-md bg-opacity-90">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Oil drop logo">
              <path d="M14 2 C14 2 6 12 6 18 C6 22.4 9.6 26 14 26 C18.4 26 22 22.4 22 18 C22 12 14 2 14 2Z" fill="var(--color-accent)" opacity="0.85"/>
              <path d="M11 16 Q14 12 17 16 Q17 20 14 21 Q11 20 11 16Z" fill="var(--color-bg)" opacity="0.3"/>
            </svg>
            <span className="text-sm font-semibold tracking-tight">Oil Price Tracker</span>
            {dataSource === 'live' && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-[var(--color-crash)] ml-2">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--color-crash)]"></span>
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span
                suppressHydrationWarning
                className="text-[10px] font-mono text-[var(--color-text-faint)] hidden sm:block"
              >
                Updated{' '}
                {lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 pb-16">
        {/* News Ticker - at the top */}
        <NewsTicker articles={news} />

        {/* Hero */}
        <section className="text-center py-8">
          <h1 className="text-[clamp(1.8rem,1.2rem+2.5vw,3rem)] font-bold tracking-tight leading-tight">
            Global Oil Prices & War Escalations
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xl mx-auto mt-2">
            Real-time crude oil benchmarks and gasoline prices across countries, with annotated conflict-driven price shocks. Auto-refreshes every 5 minutes.
          </p>
        </section>

        {/* KPIs */}
        <KpiRow oilData={oilData} livePrices={livePrices} />

        {/* Main Chart */}
        <OilChart oilData={oilData} warZones={warZones} warEvents={warEvents} />

        {/* Gasoline Chart */}
        <GasolineChart data={gasolinePrices} />

        {/* War Timeline */}
        <Timeline events={warEvents} />

        {/* Sources */}
        <section className="border-t border-[var(--color-divider)] pt-6 mb-8">
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-2">Data Sources</h3>
          <p className="text-xs text-[var(--color-text-faint)] leading-relaxed">
            Live prices: <a href="https://finance.yahoo.com/" className="underline underline-offset-2 hover:text-[var(--color-text-muted)]" target="_blank" rel="noopener">Yahoo Finance</a>.
            Historical: <a href="https://fred.stlouisfed.org/series/MCOILBRENTEU" className="underline underline-offset-2 hover:text-[var(--color-text-muted)]" target="_blank" rel="noopener">FRED</a>,{' '}
            <a href="https://tradingeconomics.com/commodity/brent-crude-oil" className="underline underline-offset-2 hover:text-[var(--color-text-muted)]" target="_blank" rel="noopener">Trading Economics</a>.
            Gasoline: <a href="https://tradingeconomics.com/country-list/gasoline-prices" className="underline underline-offset-2 hover:text-[var(--color-text-muted)]" target="_blank" rel="noopener">Trading Economics</a>.
            News: Google News RSS.
          </p>
        </section>
      </main>

      <footer className="text-center py-6 border-t border-[var(--color-divider)]">
        <a href="https://github.com/shaheerxt/oil-price-tracker" className="text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]" target="_blank" rel="noopener">
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
