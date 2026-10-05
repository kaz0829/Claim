import config from "../config.js";

export default function RecentClaims() {
  const claims = config.recentClaims || [];

  if (!claims.length) return null;

  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-10">
      <div className="card-shell overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <h3 className="font-display text-sm font-bold tracking-wide uppercase">
              Recent Claims
            </h3>
          </div>
          <span className="text-xs font-semibold tracking-wider text-white/40 uppercase">
            Live
          </span>
        </div>

        <ul className="divide-y divide-white/5">
          {claims.map((c, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="font-mono text-white/70">{c.wallet}</span>
                <span className="hidden text-white/30 sm:inline">claimed</span>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="font-display font-bold text-[var(--c-primary)]">
                  {c.amount} {config.ticker}
                </span>
                <span className="w-20 text-right text-xs text-white/40">
                  {c.time}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}