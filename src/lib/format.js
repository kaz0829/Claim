export function shortAddress(address) {
  if (!address || address.length < 10) return address || "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function readFlag(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeFlag(key, value) {
  try {
    if (value == null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}
