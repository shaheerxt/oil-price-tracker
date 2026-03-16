'use client';

import { useEffect, useRef, useState } from 'react';
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
  const tooltipRef = useRef(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  // Track container size with ResizeObserver
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDims({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Draw chart whenever dims or data change
  useEffect(() => {
    const container = ref.current;
    if (!container || dims.width === 0 || dims.height === 0 || !data?.length) return;

    // Clear previous
    d3.select(container).selectAll('svg').remove();

    const margin = { top: 12, right: 60, bottom: 28, left: 120 };
    const { width, height } = dims;
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    if (w <= 0 || h <= 0) return;

    const sorted = [...data].sort((a, b) => a.price - b.price);
    const maxPrice = d3.max(sorted, d => d.price);

    const svg = d3.select(container).append('svg')
      .attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand().domain(sorted.map(d => d.country)).range([0, h]).padding(0.3);
    const x = d3.scaleLinear().domain([0, Math.ceil(maxPrice * 1.15 * 10) / 10]).range([0, w]);

    // Grid lines
    g.append('g').attr('class', 'grid')
      .call(d3.axisBottom(x).ticks(6).tickSize(h).tickFormat(''));

    // Tooltip element
    const tooltip = d3.select(tooltipRef.current);

    // Bars
    g.selectAll('.bar').data(sorted).enter().append('rect')
      .attr('x', 0)
      .attr('y', d => y(d.country))
      .attr('width', d => x(d.price))
      .attr('height', y.bandwidth())
      .attr('rx', 3)
      .style('fill', d => regionColors[d.region] || getCSS('--color-accent'))
      .style('cursor', 'pointer')
      .style('transition', 'opacity 120ms')
      .on('mouseenter', function(event, d) {
        d3.select(this).style('opacity', 0.75);
        tooltip
          .classed('visible', true)
          .html(`
            <div style="font-weight:600;font-size:13px;margin-bottom:2px">${d.country}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
              <span style="width:8px;height:8px;border-radius:50%;background:${regionColors[d.region] || getCSS('--color-accent')};display:inline-block"></span>
              <span style="font-size:11px;opacity:0.7">${d.region}</span>
            </div>
            <div style="font-size:15px;font-weight:700;font-family:'JetBrains Mono',monospace">$${d.price.toFixed(2)}<span style="font-size:10px;font-weight:400;opacity:0.6"> /liter</span></div>
          `);
      })
      .on('mousemove', function(event) {
        const containerRect = container.getBoundingClientRect();
        const tx = event.clientX - containerRect.left + 14;
        const ty = event.clientY - containerRect.top - 10;
        tooltip
          .style('left', tx + 'px')
          .style('top', ty + 'px');
      })
      .on('mouseleave', function() {
        d3.select(this).style('opacity', 1);
        tooltip.classed('visible', false);
      });

    // Country labels
    g.selectAll('.label').data(sorted).enter().append('text')
      .attr('x', -8)
      .attr('y', d => y(d.country) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '11px')
      .style('fill', getCSS('--color-text-muted'))
      .text(d => d.country);

    // Price labels at end of bar
    g.selectAll('.val').data(sorted).enter().append('text')
      .attr('x', d => x(d.price) + 6)
      .attr('y', d => y(d.country) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', getCSS('--color-text'))
      .style('font-family', "'JetBrains Mono', monospace")
      .text(d => `$${d.price.toFixed(2)}`);

    // X axis
    g.append('g').attr('class', 'axis').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d => `$${d}`));
  }, [data, dims]);

  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <h2 className="text-lg font-semibold tracking-tight">Gasoline Prices by Country (USD/Liter)</h2>
        <p className="text-xs text-[var(--color-text-muted)]">Feb 2026 retail prices. Hover for details.</p>
      </div>
      <div ref={ref} className="w-full h-[580px] relative">
        <div
          ref={tooltipRef}
          className="chart-tooltip"
          style={{ position: 'absolute', pointerEvents: 'none' }}
        />
      </div>
    </section>
  );
}
