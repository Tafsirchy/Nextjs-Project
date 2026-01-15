"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Placeholder publishable key
const stripePromise = loadStripe("pk_test_51O...[PLACEHOLDER]...");

export default function StripeProvider({ children, clientSecret, isMock }) {
  if (!clientSecret || isMock) return children;

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#8b5cf6', // purple-600
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
