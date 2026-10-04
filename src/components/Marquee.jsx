import config from "../config.js";

export default function Marquee() {
  const label = `$${config.ticker}  ·  ${config.tokenName}`;
  const items = Array.from({ length: 14 }, () => label);

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div className="flex gap-7 pr-7" key={copy}>
            {items.map((item, index) => (
              <span key={`${copy}-${index}`}>{item}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
