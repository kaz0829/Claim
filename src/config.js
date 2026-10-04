/**
 * Only file you need to edit when reusing this page for another token.
 * Components read names, colors, copy, chain, and the API URL from here.
 */
const config = {
  tokenName: "STONK",
  ticker: "STONK",
  logoUrl: "/stonk-logo.png",
  tagline: "Tokenized markets. Internet speed. Community owned.",
  heroLines: ["THE MARKET", "NEEDS MORE", "STONK."],
  description:
    "Check your STONK community allocation. Sign a free message to verify your Solana wallet, then the distributor sends eligible tokens directly to you.",
  primaryColor: "#c9ff3d",
  accentColor: "#6c5cff",
  backgroundColor: "#080908",
  claimButtonText: "Check & claim STONK",
  connectButtonText: "Connect Solana wallet",
  successMessage: "STONK landed in your wallet",
  backendBaseUrl: "https://your-backend.railway.app",
  tokenAddress: "6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx",

  chain: {
    chainName: "Solana",
    network: "mainnet-beta",
    explorerUrl: "https://solscan.io",
  },

  links: [
    { label: "Trade on StonkFun", href: "https://www.stonkfun.xyz/token/6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx" },
    { label: "X / Twitter", href: "https://x.com/launchonsf" },
    { label: "Telegram", href: "https://t.me/stonkfunxyz" },
  ],

  facts: [
    { value: "1B", label: "Total supply", note: "On-chain supply" },
    { value: "9", label: "Decimals", note: "Solana SPL token" },
    { value: "SOL", label: "Network", note: "Mainnet" },
  ],

  promo: {
    eyebrow: "THE STONK DROP",
    headline: "Markets are serious. STONK doesn't have to be.",
    body: "STONK is the native token of StonkFun, a Solana launchpad built around markets paired with tokenized equities, currencies, commodities, and internet culture.",
    bullets: [
      "One wallet, one eligibility check",
      "No token approvals or wallet transfers",
      "Distributor-funded SPL token delivery",
    ],
    demoReceipt: {
      eyebrow: "DEMO RECEIPT · UI PREVIEW",
      status: "SENT",
      amount: "10,000",
      ticker: "STONK",
      amountLabel: "Example allocation",
      message: "A real Solana signature and explorer link appear here only after a confirmed claim.",
      signatureLabel: "TRANSACTION",
      signatureValue: "Available after confirmation",
    },
  },

  ui: {
    pageTitle: "Claim $STONK | StonkFun Community Drop",
    kicker: "Campaign preview · Solana",
    cardTitle: "Claim your STONK",
    disconnectLabel: "Disconnect",
    connectedLabel: "Connected",
    contractLabel: "Verified Solana mint",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    explorerLabel: "View",
    txLabel: "View transaction",
    preparingText: "Checking your allocation…",
    signingText: "Sign the free message in your wallet. This is not a transaction.",
    confirmingText: "Waiting for the transaction to confirm…",
    submittingText: "Signature verified. Sending your tokens…",
    preparingButton: "Checking…",
    signingButton: "Sign in wallet",
    confirmingButton: "Confirming…",
    submittingButton: "Sending…",
    retryText: "Try again",
    successKicker: "You're in",
    walletMissingText: "No Solana wallet detected. Install Phantom, Solflare, or Backpack, then refresh.",
    rejectedText: "Signature cancelled. You can try again when you're ready.",
    connectFailedText: "Could not connect the wallet.",
    claimFailedText: "Claim failed. Try again.",
    networkErrorText: "Could not reach the claim service. Check the backend URL and try again.",
    invalidPrepareText: "The claim service returned an unexpected response. Try again later.",
    txFailedText: "The transaction did not confirm. Nothing was sent.",
    footerText: "Signing is free. This site never asks you to send SOL, approve tokens, or share a recovery phrase.",
    stepConnect: "Connect",
    stepSign: "Sign",
    stepDone: "Claimed",
  },
};

export default config;
