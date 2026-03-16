'use client';

import * as d3 from 'd3';

const parseDate = d3.timeParse('%Y-%m');
const formatDate = d3.timeFormat('%b %Y');

export default function Timeline({ events }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold tracking-tight mb-6">Key War Escalation Events & Oil Impact</h2>
      <div className="grid gap-4">
        {events.map((event, i) => {
          const isLast = i === events.length - 1;
          const dotColor = event.impact === 'spike' ? 'bg-[var(--color-spike)]'
            : event.impact === 'crash' ? 'bg-[var(--color-crash)]' : 'bg-[var(--color-elevated)]';
          const badgeBg = event.impact === 'spike' ? 'bg-red-500/10 text-[var(--color-spike)]'
            : event.impact === 'crash' ? 'bg-green-500/10 text-[var(--color-crash)]' : 'bg-yellow-500/10 text-[var(--color-elevated)]';

          return (
            <div key={i} className="grid grid-cols-[40px_1fr] gap-4 relative">
              <div className="flex flex-col items-center pt-1">
                <div className={`w-3 h-3 rounded-full ${dotColor} z-10 shrink-0`} />
                {!isLast && <div className="w-0.5 flex-1 bg-[var(--color-divider)] mt-1" />}
              </div>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 pr-5">
                <div className="text-[11px] font-mono text-[var(--color-text-faint)] mb-1">
                  {formatDate(parseDate(event.date))}
                </div>
                <div className="text-base font-semibold mb-1">{event.title}</div>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-[60ch]">
                  {event.description}
                </p>
                <span className={`inline-block text-[11px] font-mono font-semibold px-2 py-0.5 rounded mt-2 ${badgeBg}`}>
                  Brent {event.brentChange}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
