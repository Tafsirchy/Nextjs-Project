"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function CheckoutForm({ onPaymentSuccess, amount, isMock }) {
  if (isMock) {
    return <MockCheckoutForm onPaymentSuccess={onPaymentSuccess} amount={amount} />;
  }

  return <RealStripeCheckoutForm onPaymentSuccess={onPaymentSuccess} amount={amount} />;
}

function MockCheckoutForm({ onPaymentSuccess, amount }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate real processing time
    setTimeout(() => {
      toast.success("MOCK PAYMENT SUCCESSFUL!");
      onPaymentSuccess({ id: "pi_mock_" + Date.now() });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-8 border-2 border-dashed rounded-xl bg-slate-50 space-y-4">
        <div className="text-center">
           <div className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded inline-block uppercase tracking-wider mb-2">
             Development Mock Mode
           </div>
           <p className="text-sm text-slate-600">Enter any digits to simulate a real payment experience.</p>
        </div>
        
        <div className="space-y-4">
           <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Card Number</label>
              <Input placeholder="4242 4242 4242 4242" className="bg-white" />
           </div>
           <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Expiry</label>
                 <Input placeholder="MM / YY" className="bg-white" />
              </div>
              <div>
                 <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">CVC</label>
                 <Input placeholder="123" className="bg-white" />
              </div>
           </div>
        </div>
      </div>
      <Button
        disabled={isLoading}
        className="w-full bike-gradient-alt text-white border-0 py-6 text-lg font-bold shadow-lg shadow-purple-200 hover:scale-[1.02] transition-transform"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Processing...
          </div>
        ) : (
          `Complete Purchase ($${amount.toLocaleString()})`
        )}
      </Button>
    </form>
  );
}

function RealStripeCheckoutForm({ onPaymentSuccess, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isElementReady, setIsElementReady] = useState(false);
  const [elementError, setElementError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if not ready
    if (!stripe || !elements || !isElementReady) {
      console.warn('Payment form not ready:', { stripe: !!stripe, elements: !!elements, isElementReady });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message);
          toast.error(error.message);
        } else {
          setMessage("An unexpected error occurred.");
          toast.error("Payment failed");
          console.error('Stripe payment error:', error);
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onPaymentSuccess(paymentIntent);
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setMessage("Failed to process payment");
      toast.error("Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Track Payment Element ready state
  const handleElementChange = (event) => {
    if (event.complete) {
      setIsElementReady(true);
      setElementError(null);
    } else if (event.error) {
      setElementError(event.error.message);
      setIsElementReady(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        {!stripe || !elements ? (
          <div className="p-8 border-2 border-dashed rounded-xl bg-slate-50 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
              <span className="text-sm text-slate-600 font-medium">Loading payment form...</span>
            </div>
          </div>
        ) : (
          <>
            <PaymentElement 
              id="payment-element" 
              options={{ layout: "tabs" }}
              onChange={handleElementChange}
              onReady={() => {
                console.log('Payment Element ready');
                setIsElementReady(true);
              }}
              onLoadError={(error) => {
                console.error('Payment Element load error:', error);
                setElementError('Failed to load payment form. Please refresh the page.');
                toast.error('Payment form failed to load');
              }}
            />
            {elementError && (
              <div className="mt-2 text-red-500 text-sm font-medium">
                {elementError}
              </div>
            )}
          </>
        )}
      </div>

      <Button
        disabled={isLoading || !stripe || !elements || !isElementReady}
        id="submit"
        type="submit"
        className="w-full bike-gradient-alt text-white border-0 py-6 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Processing...
          </div>
        ) : !isElementReady ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Loading...
          </div>
        ) : (
          `Pay Now ($${amount.toLocaleString()})`
        )}
      </Button>
      {message && <div className="text-red-500 text-sm font-medium text-center">{message}</div>}
    </form>
  );
}
