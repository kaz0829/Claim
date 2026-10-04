/**
 * Only file you need to edit when reusing this page for another token.
 * Components read names, colors, copy, chain, and the API URL from here.
 */
const config = {
  tokenName: "Gloop",
  ticker: "GLOOP",
  logoUrl: "/logo.svg",
  tagline: "One wallet. One signature. Tokens sent straight to you.",
  description:
    "Connect your wallet and sign a short message to prove it's yours. Signing moves nothing out of your wallet — the airdrop is sent to you after you sign.",
  primaryColor: "#e8ff47",
  accentColor: "#ff5c39",
  backgroundColor: "#09090b",
  claimButtonText: "Claim Airdrop",
  connectButtonText: "Connect Wallet",
  successMessage: "Airdrop claimed successfully",
  backendBaseUrl: "https://your-backend.railway.app",
  tokenAddress: "0x0000000000000000000000000000000000000000",

  chain: {
    chainId: 8453,
    chainName: "Base",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },

  /** Optional. Items with an empty href are hidden. */
  links: [],

  ui: {
    pageTitle: "Claim $GLOOP",
    kicker: "Airdrop live",
    cardTitle: "Claim your allocation",
    disconnectLabel: "Disconnect",
    connectedLabel: "Connected",
    contractLabel: "Token contract",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    explorerLabel: "View",
    txLabel: "View transaction",
    switchNetworkText: "Switch network",
    wrongNetworkLabel: "Wrong network",
    preparingText: "Checking your allocation…",
    signingText: "Sign the message in your wallet to confirm it's yours.",
    confirmingText: "Waiting for the transaction to confirm…",
    submittingText: "Signature verified. Sending your tokens…",
    preparingButton: "Checking…",
    signingButton: "Sign in wallet",
    confirmingButton: "Confirming…",
    submittingButton: "Sending…",
    retryText: "Try again",
    successKicker: "You're in",
    walletMissingText: "No wallet detected. Install MetaMask, then refresh this page.",
    rejectedText: "Signature cancelled. You can try again when you're ready.",
    connectFailedText: "Could not connect the wallet.",
    switchFailedText: "Could not switch network.",
    claimFailedText: "Claim failed. Try again.",
    networkErrorText: "Could not reach the claim service. Check the backend URL and try again.",
    invalidPrepareText: "The claim service returned an unexpected response. Try again later.",
    txFailedText: "The transaction did not confirm. Nothing was sent.",
    footerText: "You only ever sign a message here. This page never asks to approve or move your tokens.",
    stepConnect: "Connect",
    stepSign: "Sign",
    stepDone: "Claimed",
  },
};

export default config;
