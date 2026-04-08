'use client';

import { useState, useMemo } from 'react';
import { formatYearMonth, formatYearMonthDay } from '../../lib/format-dates';

export default function Timeline({ events }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (monthKey) => {
    setExpanded((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  const newestFirst = useMemo(() => {
    const list = Array.isArray(events) ? events : [];
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [events]);

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold tracking-tight mb-6">Key War Escalation Events & Oil Impact</h2>
      <div className="grid gap-4">
        {newestFirst.map((event, i) => {
          const isLast = i === newestFirst.length - 1;
          const dotColor = event.impact === 'spike' ? 'bg-[var(--color-spike)]'
            : event.impact === 'crash' ? 'bg-[var(--color-crash)]' : 'bg-[var(--color-elevated)]';
          const badgeBg = event.impact === 'spike' ? 'bg-red-500/10 text-[var(--color-spike)]'
            : event.impact === 'crash' ? 'bg-green-500/10 text-[var(--color-crash)]' : 'bg-yellow-500/10 text-[var(--color-elevated)]';

          const daily = Array.isArray(event.dailyUpdates) && event.dailyUpdates.length > 0
            ? [...event.dailyUpdates].sort((a, b) => b.date.localeCompare(a.date))
            : [];
          const isOpen = !!expanded[event.date];
          const panelId = `daily-panel-${event.date.replace(/[^a-zA-Z0-9_-]/g, '')}`;

          return (
            <div key={event.date} className="grid grid-cols-[40px_1fr] gap-4 relative min-w-0">
              <div className="flex flex-col items-center pt-1">
                <div className={`w-3 h-3 rounded-full ${dotColor} z-10 shrink-0`} />
                {!isLast && <div className="w-0.5 flex-1 bg-[var(--color-divider)] mt-1 min-h-[12px]" />}
              </div>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 pr-5 min-w-0">
                <div className="text-[11px] font-mono text-[var(--color-text-faint)] mb-1">
                  {formatYearMonth(event.date)}
                </div>
                <div className="text-base font-semibold mb-1">{event.title}</div>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-[60ch]">
                  {event.description}
                </p>
                <span className={`inline-block text-[11px] font-mono font-semibold px-2 py-0.5 rounded mt-2 ${badgeBg}`}>
                  Brent {event.brentChange}
                </span>

                {daily.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[var(--color-divider)]">
                    <button
                      type="button"
                      id={`daily-trigger-${event.date}`}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(event.date)}
                      className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs font-semibold text-[var(--color-accent)] hover:underline underline-offset-2 w-full min-w-0 text-left"
                    >
                      <span className="inline-flex items-center gap-2 min-w-0">
                        <span
                          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[10px] font-mono leading-none transition-transform"
                          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                          aria-hidden
                        >
                          ›
                        </span>
                        <span className="whitespace-nowrap">Daily highlights ({daily.length})</span>
                      </span>
                      <span className="text-[var(--color-text-faint)] font-normal font-mono text-[11px] leading-snug">
                        — most discussed market drivers
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={`daily-trigger-${event.date}`}
                        className="mt-3"
                      >
                        <ul className="space-y-3 pl-0 list-none border-l-2 border-[var(--color-divider)] ml-1">
                          {daily.map((d) => (
                            <li key={d.date} className="pl-4 relative">
                              <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[var(--color-border)] ring-2 ring-[var(--color-surface)]" />
                              <div className="text-[10px] font-mono uppercase tracking-wide text-[var(--color-text-faint)] mb-0.5">
                                {formatYearMonthDay(d.date)}
                              </div>
                              <div className="text-sm font-medium text-[var(--color-text-muted)]">{d.title}</div>
                              <p className="text-xs text-[var(--color-text-faint)] leading-relaxed mt-1 max-w-[62ch]">
                                {d.description}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
