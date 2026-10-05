import { useCallback, useState } from "react";
import { Buffer } from "buffer";
import { Transaction } from "@solana/web3.js";
import config from "../config.js";
import { prepareClaim, submitClaim } from "../lib/api.js";
import { messageFor } from "../lib/errors.js";
import { getProvider, publicKeyString } from "../lib/wallet.js";

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

      const prepared = await prepareClaim(config.backendBaseUrl, user);
      if (prepared.description) setDetail(prepared.description);

      setPhase("signing");

      const tx = Transaction.from(Buffer.from(prepared.transaction, "base64"));
      const { signature } = await provider.signAndSendTransaction(tx);

      setPhase("submitting");

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