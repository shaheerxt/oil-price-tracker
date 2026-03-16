'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

const parseDate = d3.timeParse('%Y-%m');
const formatDate = d3.timeFormat('%b %Y');

function getCSS(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

export default function OilChart({ oilData, warZones, warEvents }) {
  const containerRef = useRef(null);
  const [timelapseIndex, setTimelapseIndex] = useState(oilData.length);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const timerRef = useRef(null);

  const draw = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.querySelectorAll('svg').forEach(s => s.remove());
    container.querySelectorAll('.chart-tooltip').forEach(t => t.remove());

    const rect = container.getBoundingClientRect();
    const margin = { top: 24, right: 40, bottom: 36, left: 52 };
    const width = rect.width;
    const height = rect.height;
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const data = oilData.slice(0, timelapseIndex).map(d => ({
      ...d,
      dateObj: parseDate(d.date),
    })).filter(d => d.dateObj);

    const allData = oilData.map(d => ({ ...d, dateObj: parseDate(d.date) })).filter(d => d.dateObj);

    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().domain(d3.extent(allData, d => d.dateObj)).range([0, w]);
    const y = d3.scaleLinear().domain([0, 150]).range([h, 0]);

    // Grid
    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(6).tickSize(-w).tickFormat(''));

    // War zones
    warZones.forEach(zone => {
      const x1 = x(parseDate(zone.start));
      const x2 = x(parseDate(zone.end));
      const zw = Math.max(x2 - x1, 20);
      g.append('rect')
        .attr('x', x1).attr('y', 0).attr('width', zw).attr('height', h)
        .style('fill', getCSS('--color-war-zone'))
        .style('stroke', getCSS('--color-war-border'))
        .style('stroke-width', 1).style('stroke-dasharray', '4,3');

      g.append('text')
        .attr('x', x1 + zw / 2).attr('y', -6)
        .attr('text-anchor', 'middle')
        .style('fill', getCSS('--color-spike'))
        .style('font-size', '9px').style('font-family', 'Inter, sans-serif').style('font-weight', '500')
        .text(zone.label);
    });

    // Axes
    g.append('g').attr('class', 'axis').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat('%Y')));
    g.append('g').attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => `$${d}`));
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('y', -40).attr('x', -h / 2).attr('text-anchor', 'middle')
      .style('font-size', '11px').style('fill', getCSS('--color-text-faint')).text('USD / Barrel');

    // Clip
    svg.append('defs').append('clipPath').attr('id', 'clip-tl')
      .append('rect').attr('width', w).attr('height', h + 20).attr('y', -10);
    const cg = g.append('g').attr('clip-path', 'url(#clip-tl)');

    const lineBrent = d3.line().x(d => x(d.dateObj)).y(d => y(d.brent)).curve(d3.curveMonotoneX);
    const lineWti = d3.line().x(d => x(d.dateObj)).y(d => y(d.wti)).curve(d3.curveMonotoneX);
    const area = d3.area().x(d => x(d.dateObj)).y0(h).y1(d => y(d.brent)).curve(d3.curveMonotoneX);

    cg.append('path').datum(data).attr('d', area)
      .style('fill', getCSS('--color-brent')).style('opacity', 0.06);
    cg.append('path').datum(data).attr('d', lineBrent)
      .style('fill', 'none').style('stroke', getCSS('--color-brent')).style('stroke-width', 2.5);
    cg.append('path').datum(data).attr('d', lineWti)
      .style('fill', 'none').style('stroke', getCSS('--color-wti')).style('stroke-width', 2);

    // Event markers
    warEvents.forEach(event => {
      const match = data.find(d => d.date === event.date);
      if (!match) return;
      const cx = x(match.dateObj), cy = y(match.brent);
      const color = event.impact === 'spike' ? getCSS('--color-spike')
        : event.impact === 'crash' ? getCSS('--color-crash') : getCSS('--color-elevated');
      cg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 8)
        .style('fill', 'none').style('stroke', color).style('stroke-width', 1.5).style('opacity', 0.4);
      cg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 4).style('fill', color);
    });

    // Tooltip
    const tip = document.createElement('div');
    tip.className = 'chart-tooltip';
    container.appendChild(tip);
    const tipLine = cg.append('line').attr('class', 'tooltip-line')
      .style('stroke', getCSS('--color-text-faint')).style('stroke-width', 1)
      .style('stroke-dasharray', '3,3').style('display', 'none');

    const bisect = d3.bisector(d => d.dateObj).left;

    svg.append('rect').attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('width', w).attr('height', h).style('fill', 'none').style('pointer-events', 'all')
      .on('mousemove', function(e) {
        const [mx] = d3.pointer(e, this);
        const x0 = x.invert(mx);
        const i = bisect(data, x0, 1);
        const d0 = data[Math.max(0, i - 1)];
        const d1 = data[Math.min(i, data.length - 1)];
        if (!d0 || !d1) return;
        const d = x0 - d0.dateObj > d1.dateObj - x0 ? d1 : d0;
        const px = x(d.dateObj);

        tipLine.style('display', null).attr('x1', px).attr('x2', px).attr('y1', 0).attr('y2', h);

        const ev = warEvents.find(ev => ev.date === d.date);
        const evHtml = ev ? `<div style="margin-top:4px;padding-top:4px;border-top:1px solid var(--color-divider);color:var(--color-spike);font-weight:500;max-width:220px;white-space:normal;font-family:Inter,sans-serif">${ev.title} (${ev.brentChange})</div>` : '';

        tip.innerHTML = `<div style="font-weight:600;margin-bottom:4px">${formatDate(d.dateObj)}</div>
          <div style="display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace"><span style="width:8px;height:8px;border-radius:50%;background:${getCSS('--color-brent')}"></span> Brent: $${d.brent.toFixed(2)}</div>
          <div style="display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace"><span style="width:8px;height:8px;border-radius:50%;background:${getCSS('--color-wti')}"></span> WTI: $${d.wti.toFixed(2)}</div>
          ${evHtml}`;
        tip.classList.add('visible');

        let left = margin.left + px + 14;
        if (left + 200 > rect.width) left = margin.left + px - 200;
        tip.style.left = left + 'px';
        tip.style.top = (margin.top + y(d.brent) - 20) + 'px';
      })
      .on('mouseleave', () => { tipLine.style('display', 'none'); tip.classList.remove('visible'); });
  }, [oilData, timelapseIndex, warZones, warEvents]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    const handler = () => draw();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [draw]);

  // Timelapse logic
  useEffect(() => {
    if (!isPlaying) return;
    const interval = Math.round(800 - (speed - 1) * 83);
    timerRef.current = setTimeout(() => {
      setTimelapseIndex(prev => {
        if (prev >= oilData.length) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, interval);
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, timelapseIndex, speed, oilData.length]);

  const play = () => {
    if (timelapseIndex >= oilData.length) setTimelapseIndex(0);
    setIsPlaying(true);
  };
  const pause = () => setIsPlaying(false);
  const reset = () => { setIsPlaying(false); setTimelapseIndex(oilData.length); };

  const pct = (timelapseIndex / oilData.length) * 100;
  const currentDate = oilData[Math.max(0, timelapseIndex - 1)]?.date || '';
  const displayDate = currentDate ? formatDate(parseDate(currentDate)) : '';

  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <h2 className="text-lg font-semibold tracking-tight">Crude Oil Benchmark Prices (USD/Barrel)</h2>
        <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1"><span className="w-3 h-[3px] rounded bg-[var(--color-brent)]"></span>Brent Crude</span>
          <span className="flex items-center gap-1"><span className="w-3 h-[3px] rounded bg-[var(--color-wti)]"></span>WTI Crude</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border border-[var(--color-war-border)] bg-[var(--color-war-zone)]"></span>War Period</span>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-[420px] relative" />

      {/* Timelapse Controls */}
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[var(--color-divider)] flex-wrap">
        {!isPlaying ? (
          <button onClick={play} className="w-9 h-9 grid place-items-center rounded-full bg-[var(--color-accent)] text-white hover:scale-105 transition-transform" aria-label="Play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
        ) : (
          <button onClick={pause} className="w-9 h-9 grid place-items-center rounded-full bg-[var(--color-accent)] text-white hover:scale-105 transition-transform" aria-label="Pause">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          </button>
        )}
        <button onClick={reset} className="w-9 h-9 grid place-items-center rounded-full bg-[var(--color-accent)] text-white hover:scale-105 transition-transform" aria-label="Reset">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </button>

        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <label htmlFor="speed">Speed:</label>
          <input id="speed" type="range" min="1" max="10" value={speed} onChange={e => setSpeed(Number(e.target.value))}
            className="w-20 accent-[var(--color-accent)]" />
          <span className="font-mono">{speed}x</span>
        </div>

        <div className="flex-1 min-w-[120px] h-1.5 bg-[var(--color-surface-offset)] rounded-full relative">
          <div className="h-full bg-[var(--color-accent)] rounded-full transition-[width] duration-75" style={{ width: `${pct}%` }} />
          <input type="range" min="0" max="100" value={pct} step="0.5"
            onChange={e => { pause(); setTimelapseIndex(Math.max(1, Math.round((Number(e.target.value) / 100) * oilData.length))); }}
            className="absolute top-[-6px] left-0 w-full h-[18px] opacity-0 cursor-pointer" />
        </div>

        <span className="text-xs font-mono text-[var(--color-text-muted)] min-w-[70px] text-right">{displayDate}</span>
      </div>
    </section>
  );
}
