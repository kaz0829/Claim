import config from "../config.js";

export default function ProjectStory() {
  const receipt = config.promo.demoReceipt;

  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-12 md:pb-16">
      <div className="story-panel">
        <div>
          <p className="terminal-label">{config.promo.eyebrow}</p>
          <h2>{config.promo.headline}</h2>
          <p className="story-copy">{config.promo.body}</p>
        </div>

        <div className="terminal-card">
          <div className="terminal-top">
            <span>{receipt.eyebrow}</span>
            <span className="terminal-live">● {receipt.status}</span>
          </div>
          <p className="receipt-amount">{receipt.amount}</p>
          <p className="receipt-token">
            ${receipt.ticker} <span>{receipt.amountLabel}</span>
          </p>
          <p className="receipt-message">{receipt.message}</p>
          <div className="receipt-signature">
            <span>{receipt.signatureLabel}</span>
            <strong>{receipt.signatureValue}</strong>
          </div>
          <ul>
            {config.promo.bullets.map((bullet) => (
              <li key={bullet}>
                <span aria-hidden="true">↗</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
