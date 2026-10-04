import { useCallback, useEffect, useState } from "react";
import config from "../config.js";
import { messageFor } from "../lib/errors.js";
import { readFlag, writeFlag } from "../lib/format.js";
import { getProvider, hasInjectedWallet, switchToChain } from "../lib/wallet.js";

const DISMISS_KEY = "claim-wallet-dismissed";

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [walletReady, setWalletReady] = useState(null);

  const sync = useCallback(async () => {
    if (!hasInjectedWallet() || readFlag(DISMISS_KEY) === "1") {
      setAddress(null);
      setChainId(null);
      return;
    }
    try {
      const provider = getProvider();
      const accounts = await provider.send("eth_accounts", []);
      if (!accounts?.length) {
        setAddress(null);
        setChainId(null);
        return;
      }
      const network = await provider.getNetwork();
      setAddress(accounts[0]);
      setChainId(Number(network.chainId));
    } catch {
      setAddress(null);
      setChainId(null);
    }
  }, []);

  useEffect(() => {
    let detach = () => {};

    const attach = () => {
      detach();
      setWalletReady(hasInjectedWallet());
      if (!hasInjectedWallet()) return;
      const onAccounts = () => sync();
      const onChain = () => sync();
      window.ethereum.on?.("accountsChanged", onAccounts);
      window.ethereum.on?.("chainChanged", onChain);
      sync();
      detach = () => {
        window.ethereum?.removeListener?.("accountsChanged", onAccounts);
        window.ethereum?.removeListener?.("chainChanged", onChain);
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
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      setAddress(await signer.getAddress());
      setChainId(Number(network.chainId));
    } catch (err) {
      const text = messageFor(err);
      setError(text === config.ui.claimFailedText ? config.ui.connectFailedText : text);
    } finally {
      setBusy(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    writeFlag(DISMISS_KEY, "1");
    setAddress(null);
    setChainId(null);
    setError("");
  }, []);

  const switchNetwork = useCallback(async () => {
    setError("");
    setBusy(true);
    try {
      await switchToChain(config.chain);
      await sync();
    } catch (err) {
      setError(messageFor(err) === config.ui.claimFailedText ? config.ui.switchFailedText : messageFor(err));
    } finally {
      setBusy(false);
    }
  }, [sync]);

  return {
    address,
    chainId,
    busy,
    error,
    setError,
    walletReady,
    onConfiguredChain: chainId === config.chain.chainId,
    connect,
    disconnect,
    switchNetwork,
  };
}
