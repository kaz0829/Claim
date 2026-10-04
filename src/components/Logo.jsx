import { useState } from "react";
import config from "../config.js";

export default function Logo({ className = "", framed = false }) {
  const [failed, setFailed] = useState(false);
  const initial = (config.ticker || config.tokenName || "?").slice(0, 1);

  const fallback = (
    <span
      className={
        framed
          ? "grid h-full w-full place-items-center rounded-[20px] bg-[var(--c-primary)] font-display text-3xl font-extrabold text-[#14140f]"
          : `${className} grid place-items-center bg-[var(--c-primary)] font-display font-extrabold text-[#14140f]`
      }
    >
      {initial}
    </span>
  );

  const image = failed || !config.logoUrl ? (
    fallback
  ) : (
    <img
      src={config.logoUrl}
      alt=""
      className={framed ? "h-full w-full rounded-[20px] object-cover" : `${className} object-cover`}
      onError={() => setFailed(true)}
    />
  );

  if (!framed) return image;

  return <div className={`logo-ring ${className}`}>{image}</div>;
}
