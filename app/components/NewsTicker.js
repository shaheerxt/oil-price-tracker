'use client';

import { useRef, useEffect, useState } from 'react';

export default function NewsTicker({ articles }) {
  const trackRef = useRef(null);
  const [duration, setDuration] = useState(30);

  const safeArticles = articles || [];

  // Calculate duration based on content width — target ~70px/s (broadcast standard)
  useEffect(() => {
    if (trackRef.current && safeArticles.length > 0) {
      const halfWidth = trackRef.current.scrollWidth / 2;
      const speed = 70; // px/s — fast enough to feel alive, slow enough to scan
      setDuration(Math.max(15, halfWidth / speed));
    }
  }, [safeArticles]);

  if (safeArticles.length === 0) return null;

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h`;
    return `${Math.floor(diffHrs / 24)}d`;
  };

  // Duplicate for seamless loop
  const items = [...safeArticles.slice(0, 10), ...safeArticles.slice(0, 10)];

  return (
    <div className="mt-4 mb-2">
      <div className="relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center h-10">
          {/* Badge */}
          <div className="shrink-0 flex items-center gap-1.5 px-3 h-full border-r border-[var(--color-divider)] bg-[var(--color-surface-offset)] z-20">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--color-news)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-news)] whitespace-nowrap">
              Live
            </span>
          </div>

          {/* Scroll track */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--color-surface), transparent)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--color-surface), transparent)' }} />

            <div
              ref={trackRef}
              className="flex items-center whitespace-nowrap ticker-scroll"
              style={{ '--ticker-duration': `${duration}s` }}
            >
              {items.map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center shrink-0 px-4 hover:text-[var(--color-news)] transition-colors"
                >
                  <span className="w-1 h-1 rounded-full bg-[var(--color-spike)] shrink-0 mr-2" />
                  <span className="text-[13px] text-[var(--color-text)] hover:text-[var(--color-news)] transition-colors">
                    {article.title}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-faint)] ml-2 shrink-0">
                    {formatTime(article.publishedAt)}
                  </span>
                  <span className="text-[var(--color-divider)] mx-3 shrink-0 text-xs">|</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
