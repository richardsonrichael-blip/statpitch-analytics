import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PAYSTACK_CHECKOUT_URL = "https://paystack.shop/pay/z-p-3bdwv5";

export function openPaystackCheckout() {
  // Paystack sends the payer back here; ?payment=success unlocks Pro locally.
  const callback = `${window.location.origin}/dashboard?payment=success`;
  const url = `${PAYSTACK_CHECKOUT_URL}?callback_url=${encodeURIComponent(callback)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
