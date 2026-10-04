import { useState } from "react";
import config from "../config.js";
import { useClaim } from "../hooks/useClaim.js";
import { shortAddress } from "../lib/format.js";
import SuccessMark from "./SuccessMark.jsx";

const PHASE_COPY = {
  preparing: { status: config.ui.preparingText, button: config.ui.preparingButton },
  signing: { status: config.ui.signingText, button: config.ui.signingButton },
  submitting: { status: config.ui.submittingText, button: config.ui.submittingButton },
};

export default function ClaimCard({ wallet }) {
  const claim = useClaim();
  const [copied, setCopied] = useState(false);
  const connected = Boolean(wallet.address);
  const succeeded = claim.phase === "success";
  const step = succeeded ? 2 : claim.busy || connected ? 1 : 0;
  const notice = claim.error || wallet.error;
  const phaseCopy = PHASE_COPY[claim.phase];
  const explorerBase = config.chain.explorerUrl?.replace(/\/+$/, "");

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(config.tokenAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="card-shell rise rise-late p-5 sm:p-7" aria-live="polite">
      <div className="relative">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">{config.ui.cardTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/65">{config.description}</p>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-3.5 py-3">
          <div className="min-w-0 text-left">
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-white/45 uppercase">
              {config.ui.contractLabel}
            </p>
            <p className="truncate font-mono text-sm text-white/90" title={config.tokenAddress}>
              {shortAddress(config.tokenAddress)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {explorerBase && (
              <a
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/75 hover:text-white"
                href={`${explorerBase}/address/${config.tokenAddress}`}
                target="_blank"
                rel="noreferrer"
              >
                {config.ui.explorerLabel}
              </a>
            )}
            <button
              type="button"
              onClick={copyAddress}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
            >
              {copied ? config.ui.copiedLabel : config.ui.copyLabel}
            </button>
          </div>
        </div>

        <ol className="mt-5 grid grid-cols-3 gap-2">
          {[config.ui.stepConnect, config.ui.stepSign, config.ui.stepDone].map((label, index) => {
            const state = index < step ? "done" : index === step ? "current" : "upcoming";
            return (
              <li
                key={label}
                className={`rounded-2xl border px-2 py-2 text-center text-xs font-semibold tracking-wide ${
                  state === "upcoming"
                    ? "border-white/10 text-white/35"
                    : "border-[color-mix(in_srgb,var(--c-primary)_45%,transparent)] text-[var(--c-primary)]"
                }`}
              >
                <span className="mb-1 block font-mono text-[0.65rem] text-white/40">0{index + 1}</span>
                {label}
              </li>
            );
          })}
        </ol>

        {succeeded ? (
          <div className="mt-6 flex flex-col items-center px-2 py-4 text-center">
            <SuccessMark />
            <p className="mt-3 text-xs font-semibold tracking-[0.16em] text-[var(--c-primary)] uppercase">
              {config.ui.successKicker}
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold tracking-tight">{config.successMessage}</p>
            {claim.txHash && explorerBase && (
              <a
                className="mt-4 text-sm font-semibold text-white/70 underline decoration-white/20 underline-offset-4 hover:text-white"
                href={`${explorerBase}/tx/${claim.txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                {config.ui.txLabel}
              </a>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {connected && (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3">
                <div className="min-w-0 text-left">
                  <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-white/45 uppercase">
                    {config.ui.connectedLabel}
                  </p>
                  <p className="truncate font-mono text-sm">{shortAddress(wallet.address)}</p>
                </div>
                <button
                  type="button"
                  onClick={wallet.disconnect}
                  disabled={claim.busy}
                  className="text-sm font-medium text-white/60 hover:text-white disabled:opacity-40"
                >
                  {config.ui.disconnectLabel}
                </button>
              </div>
            )}

            {wallet.walletReady === false && !connected ? (
              <p className="rounded-2xl border border-[color-mix(in_srgb,var(--c-accent)_50%,transparent)] bg-[color-mix(in_srgb,var(--c-accent)_12%,transparent)] px-4 py-3 text-sm text-white/85">
                {config.ui.walletMissingText}
              </p>
            ) : connected && !wallet.onConfiguredChain ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={wallet.switchNetwork}
                disabled={wallet.busy || claim.busy}
              >
                {wallet.busy && <span className="spinner" aria-hidden="true" />}
                {config.ui.switchNetworkText}
              </button>
            ) : connected ? (
              <button type="button" className="btn btn-primary" onClick={claim.claim} disabled={claim.busy}>
                {claim.busy && <span className="spinner" aria-hidden="true" />}
                {phaseCopy?.button || (claim.phase === "error" ? config.ui.retryText : config.claimButtonText)}
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={wallet.connect} disabled={wallet.busy}>
                {wallet.busy && <span className="spinner" aria-hidden="true" />}
                {config.connectButtonText}
              </button>
            )}

            {(phaseCopy || claim.detail) && (
              <div className="space-y-1 text-center text-sm text-white/60">
                {phaseCopy && <p>{phaseCopy.status}</p>}
                {claim.detail && <p className="text-white/80">{claim.detail}</p>}
              </div>
            )}
          </div>
        )}

        {notice && !succeeded && (
          <p className="mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--c-accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--c-accent)_12%,transparent)] px-4 py-3 text-sm leading-relaxed text-white/90">
            {notice}
          </p>
        )}
      </div>
    </section>
  );
}
