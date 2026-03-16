'use client';

export default function NewsTicker({ articles }) {
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

  return (
    <section className="mt-6 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-news)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--color-news)]">
            <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
            <path d="M18 14h-8M18 18h-8M18 10h-8"/>
          </svg>
          Latest News
        </span>
        <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--color-news)]"></span>
      </div>
      <div className="grid gap-2">
        {articles.slice(0, 6).map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-news)] transition-colors"
          >
            <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-news)] opacity-60 group-hover:opacity-100 transition-opacity"></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-[var(--color-text)] group-hover:text-[var(--color-news)] transition-colors line-clamp-2">
                {article.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono text-[var(--color-text-faint)]">{article.source}</span>
                <span className="text-[10px] text-[var(--color-text-faint)]">·</span>
                <span className="text-[10px] font-mono text-[var(--color-text-faint)]">{formatTime(article.publishedAt)}</span>
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-1 text-[var(--color-text-faint)] group-hover:text-[var(--color-news)] transition-colors">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </a>
        ))}
      </div>
    </section>
  );
}
