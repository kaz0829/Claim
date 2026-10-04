import config from "../config.js";
import Logo from "./Logo.jsx";

export default function Header() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5">
      <div className="flex min-w-0 items-center gap-3">
        <Logo className="h-9 w-9 shrink-0 rounded-full" />
        <span className="truncate font-display text-sm font-bold tracking-wide">{config.tokenName}</span>
      </div>
      <span className="shrink-0 rounded-full border border-[var(--c-line)] px-3 py-1 text-xs font-semibold tracking-wide text-white/70">
        {config.chain.chainName} mainnet
      </span>
    </header>
  );
}
