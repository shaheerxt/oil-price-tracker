'use client';

import { formatYearMonth } from '../../lib/format-dates';

export default function KpiRow({ oilData, livePrices }) {
  const latest = oilData[oilData.length - 1];
  const prev = oilData[oilData.length - 2];
  const brentCurrent = livePrices?.brent || latest?.brent || 0;
  const wtiCurrent = livePrices?.wti || latest?.wti || 0;

  const brentChange = prev ? ((brentCurrent - prev.brent) / prev.brent * 100).toFixed(0) : 0;
  const wtiChange = prev ? ((wtiCurrent - prev.wti) / prev.wti * 100).toFixed(0) : 0;

  // Find peak
  let peak = { brent: 0, date: '' };
  oilData.forEach(d => {
    if (d.brent > peak.brent) { peak = { brent: d.brent, date: d.date }; }
  });

  const peakDate = peak.date ? formatYearMonth(peak.date) : '';

  const cards = [
    {
      label: 'Brent Crude',
      value: `$${brentCurrent.toFixed(2)}`,
      delta: `${brentChange > 0 ? '+' : ''}${brentChange}% vs prev month`,
      isNeg: brentChange > 10,
    },
    {
      label: 'WTI Crude',
      value: `$${wtiCurrent.toFixed(2)}`,
      delta: `${wtiChange > 0 ? '+' : ''}${wtiChange}% vs prev month`,
      isNeg: wtiChange > 10,
    },
    {
      label: 'Peak Since 2020',
      value: `$${peak.brent.toFixed(2)}`,
      delta: peakDate,
      isNeg: false,
    },
    {
      label: 'War-Driven Surge',
      value: '+56%',
      delta: 'Brent rise from Ukraine war',
      isNeg: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest font-medium text-[var(--color-text-muted)]">{card.label}</span>
          <span className="text-2xl lg:text-3xl font-bold font-mono">{card.value}</span>
          <span className={`text-[11px] font-mono ${card.isNeg ? 'text-[var(--color-spike)]' : 'text-[var(--color-text-faint)]'}`}>
            {card.delta}
          </span>
        </div>
      ))}
    </div>
  );
}
