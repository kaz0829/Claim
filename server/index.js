/**
 * Solana SPL-token airdrop service.
 *
 * The claimant signs a plain text message. After verification, this server
 * transfers tokens from the distributor's associated token account to the
 * claimant's associated token account. It never requests a user transaction.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { createClient } from "@solana/client";
import { address, createKeyPairSignerFromBytes } from "@solana/kit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "16kb" }));

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const DISTRIBUTOR_PRIVATE_KEY = process.env.DISTRIBUTOR_PRIVATE_KEY || "";
const EXPECTED_MINT = process.env.TOKEN_MINT || "";
const NONCE_TTL_MS = Number(process.env.NONCE_TTL_MS || 10 * 60 * 1000);
const solana = createClient({ endpoint: RPC_URL });

async function readKeypair(value) {
  if (!value) return null;
  try {
    const bytes = value.trim().startsWith("[")
      ? Uint8Array.from(JSON.parse(value))
      : bs58.decode(value.trim());
    return await createKeyPairSignerFromBytes(bytes);
  } catch {
    throw new Error("DISTRIBUTOR_PRIVATE_KEY must be a base58 key or JSON byte array");
  }
}

let distributor = null;
try {
  distributor = await readKeypair(DISTRIBUTOR_PRIVATE_KEY);
} catch (error) {
  console.error(`[claim] ${error.message}`);
}

function readJson(filename, fallback = {}) {
  const file = path.join(__dirname, filename);
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`[claim] ${filename} is invalid: ${error.message}`);
    return fallback;
  }
}

const allocations = readJson("allocations.json");
const claimed = readJson("claims.json");
const defaultAllocation = process.env.DEFAULT_ALLOCATION || "";
const pendingNonces = new Map();
const processing = new Set();

function isPublicKey(value) {
  try {
    address(value);
    return true;
  } catch {
    return false;
  }
}

function keyOf(mint, user) {
  return `${mint}:${user}`;
}

function allocationFor(user) {
  const amount = allocations[user] ?? defaultAllocation;
  return amount && Number(amount) > 0 ? String(amount) : null;
}

function persistClaims() {
  const target = path.join(__dirname, "claims.json");
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(claimed, null, 2));
  fs.renameSync(temporary, target);
}

function buildMessage(mint, user, nonce) {
  return [
    "STONK community airdrop",
    `Mint: ${mint}`,
    `Wallet: ${user}`,
    `Nonce: ${nonce}`,
    `Issued: ${new Date().toISOString()}`,
    "This signature is free and does not authorize a transaction.",
  ].join("\n");
}

function validateMint(mint) {
  if (!isPublicKey(mint)) return "valid Solana token mint required";
  if (EXPECTED_MINT && mint !== EXPECTED_MINT) return "unsupported token mint";
  return "";
}

app.get("/", (_req, res) => {
  res.json({
    status: "operational",
    service: "stonk-airdrop",
    chain: "solana",
    mode: "distribution-only",
    version: "3.0.0",
  });
});

app.post("/prepare-claim", (req, res) => {
  const { token, user } = req.body || {};
  const mintError = validateMint(token);
  if (mintError) return res.status(400).json({ error: mintError });
  if (!isPublicKey(user)) return res.status(400).json({ error: "valid Solana wallet required" });

  const key = keyOf(token, user);
  if (claimed[key]) return res.status(409).json({ error: "this wallet has already claimed" });

  const amount = allocationFor(user);
  if (!amount) return res.status(403).json({ error: "this wallet is not eligible for this drop" });

  const nonce = crypto.randomUUID();
  const message = buildMessage(token, user, nonce);
  pendingNonces.set(key, { message, issuedAt: Date.now() });

  return res.json({
    message,
    nonce,
    token,
    user,
    amount,
    description: `Eligible for ${amount} STONK. Signing is free and cannot move assets.`,
  });
});

app.post("/submit-claim", async (req, res) => {
  const { token, user, signature } = req.body || {};
  const mintError = validateMint(token);
  if (mintError) return res.status(400).json({ error: mintError });
  if (!isPublicKey(user)) return res.status(400).json({ error: "valid Solana wallet required" });
  if (typeof signature !== "string" || !signature) {
    return res.status(400).json({ error: "signature required" });
  }
  if (!distributor) {
    return res.status(503).json({ error: "distribution wallet is not configured" });
  }

  const key = keyOf(token, user);
  if (claimed[key]) return res.status(409).json({ error: "this wallet has already claimed" });
  if (processing.has(key)) return res.status(409).json({ error: "this claim is already processing" });

  const pending = pendingNonces.get(key);
  if (!pending) return res.status(400).json({ error: "no pending claim — start again" });
  if (Date.now() - pending.issuedAt > NONCE_TTL_MS) {
    pendingNonces.delete(key);
    return res.status(400).json({ error: "claim request expired — start again" });
  }

  let signatureBytes;
  try {
    signatureBytes = Buffer.from(signature, "base64");
  } catch {
    return res.status(400).json({ error: "invalid signature encoding" });
  }
  if (signatureBytes.length !== nacl.sign.signatureLength) {
    return res.status(400).json({ error: "invalid signature encoding" });
  }

  const verified = nacl.sign.detached.verify(
    new TextEncoder().encode(pending.message),
    signatureBytes,
    bs58.decode(user),
  );
  if (!verified) return res.status(401).json({ error: "signature does not match this wallet" });

  const amount = allocationFor(user);
  if (!amount) return res.status(403).json({ error: "this wallet is not eligible for this drop" });

  processing.add(key);
  pendingNonces.delete(key);
  try {
    const stonk = solana.splToken({
      mint: token,
      tokenProgram: "auto",
      commitment: "confirmed",
    });
    const txHash = await stonk.sendTransfer({
      amount,
      authority: distributor,
      destinationOwner: user,
      commitment: "confirmed",
    });
    const signature = txHash.toString();
    claimed[key] = {
      txHash: signature,
      amount,
      claimedAt: new Date().toISOString(),
    };
    persistClaims();

    return res.json({
      success: true,
      status: "success",
      txHash: signature,
      claimed: amount,
      token,
      symbol: "STONK",
      message: "airdrop sent",
    });
  } catch (error) {
    console.error("[claim]", error);
    return res.status(500).json({ error: "claim transfer failed — contact the team" });
  } finally {
    processing.delete(key);
  }
});

app.get("/eligibility/:token/:address", (req, res) => {
  const { token, address } = req.params;
  if (validateMint(token) || !isPublicKey(address)) {
    return res.status(400).json({ error: "valid mint and wallet required" });
  }
  const amount = allocationFor(address);
  const prior = claimed[keyOf(token, address)];
  return res.json({
    eligible: Boolean(amount) && !prior,
    amount: amount || "0",
    claimed: Boolean(prior),
    txHash: prior?.txHash || "",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`STONK Solana airdrop service running on port ${PORT}`);
});
