import { BrowserProvider } from "ethers";

export function hasInjectedWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export function getProvider() {
  if (!hasInjectedWallet()) throw new Error("NO_WALLET");
  return new BrowserProvider(window.ethereum);
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

export async function switchToChain(chain) {
  if (!hasInjectedWallet()) throw new Error("NO_WALLET");
  const chainId = `0x${chain.chainId.toString(16)}`;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (error) {
    const missing = error?.code === 4902 || error?.data?.originalError?.code === 4902;
    if (!missing) throw error;
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId,
          chainName: chain.chainName,
          rpcUrls: [chain.rpcUrl],
          nativeCurrency: chain.nativeCurrency,
          blockExplorerUrls: chain.explorerUrl ? [chain.explorerUrl] : undefined,
        },
      ],
    });
  }
}
