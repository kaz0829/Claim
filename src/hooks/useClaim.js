import { useCallback, useState } from "react";
import config from "../config.js";
import { prepareClaim, submitClaim } from "../lib/api.js";
import { messageFor } from "../lib/errors.js";
import { assertPrepared, getProvider } from "../lib/wallet.js";

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
      const signer = await provider.getSigner();
      const user = await signer.getAddress();

      const prepared = assertPrepared(
        await prepareClaim(config.backendBaseUrl, config.tokenAddress, user),
      );
      if (prepared.description) setDetail(prepared.description);

      setPhase("signing");
      const signature = await signer.signMessage(prepared.message);

      setPhase("submitting");
      const result = await submitClaim(config.backendBaseUrl, {
        token: config.tokenAddress,
        user,
        signature,
      });
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
