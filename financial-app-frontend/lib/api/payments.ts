import { apiFetch } from "./client"

type CheckoutSessionResponse = {
  url: string
}

type PortalSessionResponse = {
  url: string
}

export async function createCheckoutSession(token: string) {
  return apiFetch<CheckoutSessionResponse>("/payments/checkout-session", token, {
    method: "POST",
  })
}


export async function createPortalSession(token: string) {
  return apiFetch<PortalSessionResponse>("/payments/portal-session", token, {
    method: "POST",
  })
}