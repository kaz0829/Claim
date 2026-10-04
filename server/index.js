/**
 * Airdrop claim backend (distribution only).
 *
 * Funds flow one direction: from the project's distributor wallet to the
 * claimer. The user never approves or transfers anything. They sign a plain
 * message so we can prove they control the address, then this service sends
 * their allocation with a standard ERC-20 `transfer`.
 *
 * It will never ask a user to `approve` a spender or build a `transferFrom`
 * that pulls tokens out of their wallet. That is a drainer pattern, not a
 * claim.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

const RPC_URL = process.env.RPC_URL;
const DISTRIBUTOR_PRIVATE_KEY = process.env.DISTRIBUTOR_PRIVATE_KEY;
const CHAIN_LABEL = process.env.CHAIN_LABEL || "the configured network";
const NONCE_TTL_MS = Number(process.env.NONCE_TTL_MS || 10 * 60 * 1000);

if (!RPC_URL || !DISTRIBUTOR_PRIVATE_KEY) {
  console.warn(
    "[claim] RPC_URL and DISTRIBUTOR_PRIVATE_KEY are not set. Copy .env.example to .env before going live.",
  );
}

const provider = RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;
const distributor =
  provider && DISTRIBUTOR_PRIVATE_KEY ? new ethers.Wallet(DISTRIBUTOR_PRIVATE_KEY, provider) : null;

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

/**
 * Allocations: who may claim and how much (in whole token units).
 * Edit server/allocations.json — { "0xaddress": "1000", ... } — or set a flat
 * DEFAULT_ALLOCATION for every address. An address with no allocation is not
 * eligible, so no one can claim what you did not assign.
 */
function loadAllocations() {
  const file = path.join(__dirname, "allocations.json");
  if (!fs.existsSync(file)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return Object.fromEntries(
      Object.entries(parsed).map(([address, amount]) => [address.toLowerCase(), String(amount)]),
    );
  } catch (err) {
    console.error("[claim] allocations.json is not valid JSON:", err.message);
    return {};
  }
}

const allocations = loadAllocations();
const defaultAllocation = process.env.DEFAULT_ALLOCATION || "";

// In-memory only. Use a database before production so pending nonces and
// completed claims survive a restart.
const pendingNonces = new Map(); // key -> { message, nonce, issuedAt }
const claimed = new Map(); // key -> txHash

const keyOf = (token, user) => `${token.toLowerCase()}:${user.toLowerCase()}`;

function allocationFor(user) {
  const amount = allocations[user.toLowerCase()] ?? defaultAllocation;
  return amount && Number(amount) > 0 ? String(amount) : null;
}

function buildMessage(token, user, nonce) {
  return [
    "Airdrop claim",
    `Token: ${token}`,
    `Address: ${user}`,
    `Nonce: ${nonce}`,
    `Issued: ${new Date().toISOString()}`,
    "Signing proves you control this wallet. It does not move any funds.",
  ].join("\n");
}

app.get("/", (_req, res) => {
  res.json({ status: "operational", service: "airdrop-claim", mode: "distribution", version: "2.0.0" });
});

/**
 * Step 1 — prepare. Returns the message the user signs. No transaction, no
 * approval. The signature only proves address ownership.
 */
app.post("/prepare-claim", async (req, res) => {
  try {
    const { token, user } = req.body || {};
    if (!ethers.isAddress(token)) return res.status(400).json({ error: "valid token address required" });
    if (!ethers.isAddress(user)) return res.status(400).json({ error: "valid user address required" });

    const key = keyOf(token, user);
    if (claimed.has(key)) {
      return res.status(409).json({ error: "this address has already claimed" });
    }

    const amount = allocationFor(user);
    if (!amount) return res.status(403).json({ error: "this address is not eligible for the airdrop" });

    const nonce = crypto.randomUUID();
    const message = buildMessage(token, user, nonce);
    pendingNonces.set(key, { message, nonce, issuedAt: Date.now() });

    res.json({
      message,
      nonce,
      token,
      user,
      amount,
      description: `You will receive ${amount} tokens. Sign to confirm — this does not move funds from your wallet.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "unable to prepare claim" });
  }
});

/**
 * Step 2 — submit. Verifies the signature, then sends the allocation from the
 * distributor wallet to the user. Funds only ever move project -> user.
 */
app.post("/submit-claim", async (req, res) => {
  try {
    if (!distributor) {
      return res.status(503).json({ error: "distribution wallet is not configured" });
    }

    const { token, user, signature } = req.body || {};
    if (!ethers.isAddress(token)) return res.status(400).json({ error: "valid token address required" });
    if (!ethers.isAddress(user)) return res.status(400).json({ error: "valid user address required" });
    if (typeof signature !== "string" || !signature) {
      return res.status(400).json({ error: "signature required" });
    }

    const key = keyOf(token, user);
    if (claimed.has(key)) {
      return res.status(409).json({ error: "this address has already claimed" });
    }

    const pending = pendingNonces.get(key);
    if (!pending) return res.status(400).json({ error: "no pending claim — call /prepare-claim first" });
    if (Date.now() - pending.issuedAt > NONCE_TTL_MS) {
      pendingNonces.delete(key);
      return res.status(400).json({ error: "claim request expired — start again" });
    }

    let recovered;
    try {
      recovered = ethers.verifyMessage(pending.message, signature);
    } catch {
      return res.status(400).json({ error: "signature could not be verified" });
    }
    if (recovered.toLowerCase() !== user.toLowerCase()) {
      return res.status(401).json({ error: "signature does not match the claiming address" });
    }

    const amount = allocationFor(user);
    if (!amount) return res.status(403).json({ error: "this address is not eligible for the airdrop" });

    // Consume the nonce up front so a replay cannot ride the same signature.
    pendingNonces.delete(key);

    const contract = new ethers.Contract(token, ERC20_ABI, distributor);
    const decimals = await contract.decimals();
    const value = ethers.parseUnits(amount, decimals);

    const distributorBalance = await contract.balanceOf(distributor.address);
    if (distributorBalance < value) {
      return res.status(503).json({ error: "distribution wallet is out of tokens — contact the team" });
    }

    const tx = await contract.transfer(user, value);
    await tx.wait();
    claimed.set(key, tx.hash);

    let symbol = "";
    try {
      symbol = await contract.symbol();
    } catch {
      /* optional */
    }

    res.json({
      success: true,
      status: "success",
      txHash: tx.hash,
      claimed: amount,
      token,
      symbol,
      message: "airdrop sent",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "claim execution failed" });
  }
});

app.get("/eligibility/:token/:address", (req, res) => {
  const { token, address } = req.params;
  if (!ethers.isAddress(address)) return res.status(400).json({ error: "valid address required" });
  const amount = allocationFor(address);
  const already = ethers.isAddress(token) && claimed.has(keyOf(token, address));
  res.json({ eligible: Boolean(amount) && !already, amount: amount || "0", claimed: already });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Airdrop claim service (distribution mode) running on port ${PORT} for ${CHAIN_LABEL}`);
});
