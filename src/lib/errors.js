import config from "../config.js";

const KNOWN = {
  NO_WALLET: config.ui.walletMissingText,
  TX_FAILED: config.ui.txFailedText,
  INVALID_PREPARE: config.ui.invalidPrepareText,
  BAD_VALUE: config.ui.invalidPrepareText,
  NETWORK: config.ui.networkErrorText,
  REQUEST_FAILED: config.ui.claimFailedText,
};

export function isUserReject(error) {
  const code = error?.code ?? error?.info?.error?.code;
  return code === 4001 || code === "ACTION_REJECTED";
}

export function messageFor(error) {
  if (isUserReject(error)) return config.ui.rejectedText;
  if (error?.message && Object.prototype.hasOwnProperty.call(KNOWN, error.message)) {
    return KNOWN[error.message];
  }
  if (typeof error?.shortMessage === "string" && error.shortMessage) return error.shortMessage;
  if (typeof error?.message === "string" && error.message) return error.message;
  return config.ui.claimFailedText;
}
