import { apiFetch } from "./client"

type CheckoutSessionResponse = {
  url: string
}

export async function createCheckoutSession(token: string) {
  return apiFetch<CheckoutSessionResponse>("/payments/checkout-session", token, {
    method: "POST",
  })
}
