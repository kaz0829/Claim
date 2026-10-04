import config from "../config.js";
import Logo from "./Logo.jsx";

export default function Hero() {
  const links = (config.links || []).filter((link) => link?.href);

  return (
    <section className="rise text-center md:text-left">
      <Logo framed className="mx-auto mb-6 md:mx-0" />
      <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-white/75 uppercase">
        <span className="live-dot" aria-hidden="true" />
        {config.ui.kicker}
      </p>
      <h1 className="font-display text-5xl leading-[0.95] font-extrabold tracking-tight text-balance break-words sm:text-6xl">
        {config.heroLines.map((line, index) => (
          <span className={index === 1 ? "text-[var(--c-primary)]" : ""} key={line}>
            {line}
            {index < config.heroLines.length - 1 && <br />}
          </span>
        ))}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-white/70 md:mx-0">{config.tagline}</p>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {config.facts.map((fact) => (
          <div className="market-stat" key={fact.label}>
            <strong>{fact.value}</strong>
            <span>{fact.label}</span>
          </div>
        ))}
      </div>
      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:-translate-y-0.5 hover:border-white/25 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
