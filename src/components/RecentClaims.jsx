import { useState, useEffect } from "react";
import config from "../config.js";

function randomWallet() {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s + "..." + chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)];
}

function randomUsd() {
  // $10 – $30
  return +(10 + Math.random() * 20).toFixed(1);
}

function formatAmount(usd) {
  const price = config.stonkPriceUsd || 0.002;
  const tokens = Math.round(usd / price);
  return tokens.toLocaleString();
}

function makeClaim() {
  return {
    wallet: randomWallet(),
    amount: formatAmount(randomUsd()),
    time: "just now",
    id: Date.now() + Math.random(),
  };
}

export default function RecentClaims() {
  const [claims, setClaims] = useState(() => {
    const seed = config.recentClaimsSeed || [];
    return seed.map((c, i) => ({
      wallet: c.wallet,
      amount: formatAmount(c.usd),
      time: `${(i + 1) * 3} min ago`,
      id: i,
    }));
  });

  useEffect(() => {
    const tick = () => {
      setClaims((prev) => {
        const next = [makeClaim(), ...prev].slice(0, 7);
        // age the older ones a bit
        return next.map((c, i) =>
          i === 0 ? c : { ...c, time: i === 1 ? "1 min ago" : `${i * 2 + 1} min ago` }
        );
      });
    };

    // first new one after 6–12s, then every 9–16s
    let timer = setTimeout(function loop() {
      tick();
      timer = setTimeout(loop, 9000 + Math.random() * 7000);
    }, 6000 + Math.random() * 6000);

    return () => clearTimeout(timer);
  }, []);

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
          {claims.map((c) => (
            <li
              key={c.id}
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