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
    (candidate, index, providers) =>
      providers.indexOf(candidate) === index &&
      typeof candidate.connect === "function" &&
      typeof candidate.signMessage === "function",
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

export function signatureToBase64(signature) {
  const bytes = signature instanceof Uint8Array ? signature : new Uint8Array(signature);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return window.btoa(binary);
}

export function assertPrepared(prepared) {
  if (!prepared || typeof prepared.message !== "string" || !prepared.message.trim()) {
    throw new Error("INVALID_PREPARE");
  }
  return {
    message: prepared.message,
    description: typeof prepared.description === "string" ? prepared.description : "",
  };
}
