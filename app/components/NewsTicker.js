'use client';

import { useState, useEffect, useRef } from 'react';

export default function NewsTicker({ articles }) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);
  const [speed, setSpeed] = useState(1);

  if (!articles || articles.length === 0) return null;

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  // Duplicate articles for seamless loop
  const items = [...articles.slice(0, 10), ...articles.slice(0, 10)];

  return (
    <div className="mt-4 mb-2">
      {/* Ticker bar */}
      <div
        className="relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-center h-11">
          {/* Label */}
          <div className="shrink-0 flex items-center gap-1.5 px-4 h-full border-r border-[var(--color-divider)] bg-[var(--color-surface-offset)]">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--color-news)]"></span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-news)] whitespace-nowrap">
              Latest
            </span>
          </div>

          {/* Scrolling track */}
          <div className="flex-1 overflow-hidden relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none" style={{background: 'linear-gradient(to right, var(--color-surface), transparent)'}} />
            <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none" style={{background: 'linear-gradient(to left, var(--color-surface), transparent)'}} />

            <div
              ref={scrollRef}
              className="flex items-center gap-0 whitespace-nowrap ticker-scroll"
              style={{
                animationPlayState: isPaused ? 'paused' : 'running',
                animationDuration: `${Math.max(40, articles.length * 8)}s`,
              }}
            >
              {items.map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-5 py-2 hover:text-[var(--color-news)] transition-colors group shrink-0"
                >
                  <span className="w-1 h-1 rounded-full bg-[var(--color-news)] opacity-50 group-hover:opacity-100 shrink-0"></span>
                  <span className="text-sm text-[var(--color-text)] group-hover:text-[var(--color-news)] transition-colors">
                    {article.title}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-faint)] shrink-0">
                    {article.source} · {formatTime(article.publishedAt)}
                  </span>
                  <span className="text-[var(--color-divider)] mx-1 shrink-0">|</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
