import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PAYSTACK_CHECKOUT_URL = "https://paystack.shop/pay/z-p-3bdwv5";

export function openPaystackCheckout() {
  window.open(PAYSTACK_CHECKOUT_URL, "_blank", "noopener,noreferrer");
}
