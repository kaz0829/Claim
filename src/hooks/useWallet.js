import { useCallback, useEffect, useState } from "react";
import config from "../config.js";
import { messageFor } from "../lib/errors.js";
import { readFlag, writeFlag } from "../lib/format.js";
import { getProvider, hasInjectedWallet, publicKeyString } from "../lib/wallet.js";

const DISMISS_KEY = "claim-wallet-dismissed";

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [walletReady, setWalletReady] = useState(null);

  const sync = useCallback(async () => {
    if (!hasInjectedWallet() || readFlag(DISMISS_KEY) === "1") {
      setAddress(null);
      return;
    }
    try {
      const provider = getProvider();
      if (provider.isConnected && provider.publicKey) {
        setAddress(publicKeyString(provider));
      } else {
        setAddress(null);
      }
    } catch {
      setAddress(null);
    }
  }, []);

  useEffect(() => {
    let detach = () => {};

    const attach = () => {
      detach();
      setWalletReady(hasInjectedWallet());
      if (!hasInjectedWallet()) return;
      const provider = getProvider();
      const onAccounts = () => sync();
      const onDisconnect = () => setAddress(null);
      provider.on?.("accountChanged", onAccounts);
      provider.on?.("connect", onAccounts);
      provider.on?.("disconnect", onDisconnect);
      sync();
      detach = () => {
        provider.removeListener?.("accountChanged", onAccounts);
        provider.removeListener?.("connect", onAccounts);
        provider.removeListener?.("disconnect", onDisconnect);
      };
    };

    attach();
    window.addEventListener("ethereum#initialized", attach);
    const retry = window.setTimeout(attach, 400);
    return () => {
      window.removeEventListener("ethereum#initialized", attach);
      window.clearTimeout(retry);
      detach();
    };
  }, [sync]);

  const connect = useCallback(async () => {
    setError("");
    if (!hasInjectedWallet()) {
      setError(config.ui.walletMissingText);
      return;
    }
    setBusy(true);
    try {
      writeFlag(DISMISS_KEY, null);
      const provider = getProvider();
      await provider.connect();
      setAddress(publicKeyString(provider));
    } catch (err) {
      const text = messageFor(err);
      setError(text === config.ui.claimFailedText ? config.ui.connectFailedText : text);
    } finally {
      setBusy(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    writeFlag(DISMISS_KEY, "1");
    try {
      getProvider().disconnect?.();
    } catch {
      /* wallet is already disconnected */
    }
    setAddress(null);
    setError("");
  }, []);

  return {
    address,
    busy,
    error,
    setError,
    walletReady,
    onConfiguredChain: true,
    connect,
    disconnect,
  };
}
