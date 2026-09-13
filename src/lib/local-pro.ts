const KEY = "isProSubscriber";
const PENDING_KEY = "statpitch:upgrade-pending";

/** Marks that a checkout was opened, so the app polls for Pro activation. */
export function setUpgradePending(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(PENDING_KEY, String(Date.now()));
    else window.localStorage.removeItem(PENDING_KEY);
    window.dispatchEvent(new Event("statpitch:pro-change"));
  } catch {
    /* storage unavailable */
  }
}

/** True while a checkout was started in the last 30 minutes. */
export function readUpgradePending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const at = Number(window.localStorage.getItem(PENDING_KEY));
    if (!at) return false;
    if (Date.now() - at > 30 * 60 * 1000) {
      window.localStorage.removeItem(PENDING_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Reads the browser-side Pro flag (set after a successful Paystack redirect). */
export function readLocalPro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

export function setLocalPro(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(KEY, "true");
    else window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("statpitch:pro-change"));
  } catch {
    /* storage unavailable */
  }
}

/**
 * If the current URL carries ?payment=success (Paystack redirect), store the
 * local unlock flag and clean the parameter out of the address bar.
 */
export function consumePaymentSuccessParam(): boolean {
  if (typeof window === "undefined") return false;
  const url = new URL(window.location.href);
  const flag = url.searchParams.get("payment");
  if (flag !== "success") return false;

  setLocalPro(true);
  url.searchParams.delete("payment");
  url.searchParams.delete("trxref");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  return true;
}
