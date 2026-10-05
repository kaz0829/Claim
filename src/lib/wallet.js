function injectedProviders() {
  if (typeof window === "undefined") return [];
  return [
    window.phantom?.solana,
    window.solflare,
    window.backpack,
    window.solana,
  ].filter(Boolean);
}

export function getProvider() {
  const provider = injectedProviders().find(
    (candidate) =>
      candidate &&
      typeof candidate.connect === "function" &&
      (typeof candidate.signAndSendTransaction === "function" ||
        typeof candidate.signTransaction === "function"),
  );
  if (!provider) throw new Error("NO_WALLET");
  return provider;
}

export function hasInjectedWallet() {
  try {
    return Boolean(getProvider());
  } catch {
    return false;
  }
}

export function publicKeyString(provider) {
  const value = provider?.publicKey?.toString?.();
  if (!value) throw new Error("NO_WALLET");
  return value;
}