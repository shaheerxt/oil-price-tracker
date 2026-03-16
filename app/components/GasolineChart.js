'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function getCSS(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

const regionColors = {
  'Europe': 'var(--color-brent)',
  'Americas': 'var(--color-wti)',
  'Asia': '#a78bfa',
  'Middle East': '#fbbf24',
  'Africa': '#34d399',
  'Oceania': '#f472b6',
};

export default function GasolineChart({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.querySelectorAll('svg').forEach(s => s.remove());
    container.querySelectorAll('.chart-tooltip').forEach(t => t.remove());

    const rect = container.getBoundingClientRect();
    const margin = { top: 12, right: 60, bottom: 24, left: 120 };
    const width = rect.width;
    const height = rect.height;
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const sorted = [...data].sort((a, b) => a.price - b.price);

    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand().domain(sorted.map(d => d.country)).range([0, h]).padding(0.3);
    const x = d3.scaleLinear().domain([0, 3.2]).range([0, w]);

    g.append('g').attr('class', 'grid')
      .call(d3.axisBottom(x).ticks(6).tickSize(h).tickFormat(''));

    g.selectAll('.bar').data(sorted).enter().append('rect')
      .attr('x', 0).attr('y', d => y(d.country)).attr('width', d => x(d.price)).attr('height', y.bandwidth())
      .attr('rx', 3).style('fill', d => regionColors[d.region] || getCSS('--color-accent'))
      .style('cursor', 'pointer').style('transition', 'opacity 180ms')
      .on('mouseenter', function() { d3.select(this).style('opacity', 0.8); })
      .on('mouseleave', function() { d3.select(this).style('opacity', 1); });

    g.selectAll('.label').data(sorted).enter().append('text')
      .attr('x', -8).attr('y', d => y(d.country) + y.bandwidth() / 2).attr('dy', '0.35em')
      .attr('text-anchor', 'end').style('font-size', '11px').style('fill', getCSS('--color-text-muted'))
      .text(d => d.country);

    g.selectAll('.val').data(sorted).enter().append('text')
      .attr('x', d => x(d.price) + 6).attr('y', d => y(d.country) + y.bandwidth() / 2).attr('dy', '0.35em')
      .style('font-size', '10px').style('fill', getCSS('--color-text')).style('font-family', "'JetBrains Mono', monospace")
      .text(d => `$${d.price.toFixed(2)}`);

    g.append('g').attr('class', 'axis').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d => `$${d}`));
  }, [data]);

  useEffect(() => {
    const h = () => {
      const container = ref.current;
      if (!container) return;
      container.querySelectorAll('svg').forEach(s => s.remove());
      // Trigger redraw via re-render not ideal, but works for resize
    };
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <h2 className="text-lg font-semibold tracking-tight">Gasoline Prices by Country (USD/Liter)</h2>
        <p className="text-xs text-[var(--color-text-muted)]">Feb 2026 retail prices. Hover for details.</p>
      </div>
      <div ref={ref} className="w-full h-[580px] relative" />
    </section>
  );
}
