const KEY = "isProSubscriber";

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
