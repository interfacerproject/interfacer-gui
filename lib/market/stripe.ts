// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Stripe's Payment Element for the marketplace checkout, with Stripe Connect
// DIRECT CHARGES: the payment is made on the seller's own Stripe account, so
// Stripe.js is initialized with that account. Card details go from the
// buyer's browser straight to Stripe (js.stripe.com); neither the GUI nor
// Medusa ever sees them. Here the payment is only AUTHORIZED: products are
// charged when the seller delivers, builds once the order exists.

import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from "@stripe/stripe-js";
import { MarketError } from "./types";

const loaders = new Map<string, Promise<Stripe | null>>();
function stripeFor(publishableKey: string, stripeAccount: string) {
  const key = `${publishableKey}|${stripeAccount}`;
  if (!loaders.has(key)) loaders.set(key, loadStripe(publishableKey, { stripeAccount }));
  return loaders.get(key)!;
}

// Statuses of an authorized (or already paid) PaymentIntent.
export const AUTHORIZED = ["requires_capture", "succeeded"];

export interface MountedPayment {
  // Validates what the buyer typed (before anything is confirmed).
  validate(): Promise<void>;
  // Confirms the payment; may redirect to the bank and come back to returnUrl
  // (the checkout then resumes, see resumeConfirmation).
  confirm(clientSecret: string, returnUrl: string): Promise<void>;
  destroy(): void;
}

export async function mountPayment(
  node: HTMLElement,
  opts: { publishableKey: string; stripeAccount: string; clientSecret: string; locale?: string }
): Promise<MountedPayment> {
  const stripe = await stripeFor(opts.publishableKey, opts.stripeAccount);
  if (!stripe) throw new MarketError("stripe_unavailable", 0);
  const elements: StripeElements = stripe.elements({
    clientSecret: opts.clientSecret,
    locale: (opts.locale as any) ?? "auto",
    appearance: {
      theme: "stripe",
      variables: { borderRadius: "6px", fontFamily: "inherit", colorPrimary: "#0b5d3b" },
    },
  });
  const element: StripePaymentElement = elements.create("payment", { layout: "tabs" });
  element.mount(node);
  return {
    async validate() {
      const { error } = await elements.submit();
      if (error) throw new MarketError(error.code || "payment_details_invalid", 400, error.message);
    },
    async confirm(clientSecret, returnUrl) {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      });
      if (error) throw new MarketError(error.code || error.type || "payment_failed", 402, error.message);
      if (!paymentIntent || !AUTHORIZED.includes(paymentIntent.status))
        throw new MarketError("payment_not_authorized", 402);
    },
    destroy() {
      element.destroy();
    },
  };
}

// Back from a bank redirect: the payment was confirmed on Stripe's side; check
// it really is authorized before the order is placed.
export function resumeConfirmation(publishableKey: string) {
  return async (clientSecret: string, stripeAccount: string) => {
    const stripe = await stripeFor(publishableKey, stripeAccount);
    if (!stripe) throw new MarketError("stripe_unavailable", 0);
    const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);
    if (error || !paymentIntent || !AUTHORIZED.includes(paymentIntent.status))
      throw new MarketError(error?.code || "payment_not_authorized", 402, error?.message);
  };
}
