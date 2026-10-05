import config from "../config.js";

export default function ProjectStory() {
  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-12 md:pb-16">
      <div className="story-panel">
        <div>
          <p className="terminal-label">{config.promo.eyebrow}</p>
          <h2>{config.promo.headline}</h2>
          <p className="story-copy">{config.promo.body}</p>
        </div>

        <div className="terminal-card">
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