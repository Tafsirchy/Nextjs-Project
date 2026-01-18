"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

// Load Stripe with environment variable
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
console.log('Stripe Publishable Key (prefix):', (stripePublishableKey || '').substring(0, 10));

if (!stripePublishableKey) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function StripeProvider({ children, clientSecret, isMock }) {
  const [stripeInitError, setStripeInitError] = useState(null);

  useEffect(() => {
    if (!isMock && clientSecret) {
      // Validate clientSecret format
      if (!clientSecret.startsWith('pi_') && !clientSecret.includes('_secret_')) {
        console.error('Invalid clientSecret format:', clientSecret.substring(0, 20));
        setStripeInitError('Invalid payment session');
      } else {
        console.log('Stripe Elements initializing with clientSecret:', clientSecret.substring(0, 20) + '...');
        setStripeInitError(null);
      }
    }
  }, [clientSecret, isMock]);

  // If mock mode or no clientSecret, render children without Stripe
  if (!clientSecret || isMock) {
    console.log('Rendering without Stripe Elements (mock mode or no clientSecret)');
    return children;
  }

  // Show error if Stripe failed to initialize
  if (!stripePromise) {
    return (
      <div className="p-6 border-2 border-red-200 rounded-xl bg-red-50">
        <p className="text-red-800 font-medium">Failed to initialize payment system. Please refresh the page.</p>
      </div>
    );
  }

  // Show error if clientSecret is invalid
  if (stripeInitError) {
    return (
      <div className="p-6 border-2 border-red-200 rounded-xl bg-red-50">
        <p className="text-red-800 font-medium">{stripeInitError}. Please try again.</p>
      </div>
    );
  }

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
