"use client";

import { API_URL } from "@/lib/api";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, MapPin, DollarSign, CheckCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import StripeProvider from "@/components/checkout/StripeProvider";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { cartItems, cartCount, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [clientSecret, setClientSecret] = useState("");
  const [isMockPayment, setIsMockPayment] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const [formData, setFormData] = useState({
    // Shipping Address
    fullName: "",
    email: session?.user?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    
    // Payment
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
    if (cartCount === 0) {
      router.push("/cart");
    }
  }, [session, cartCount, router]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setValidatingPromo(true);
    try {
      const response = await fetch(`${API_URL}/api/promos/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode })
      });
      
      const data = await response.json();
      if (data.success) {
        setAppliedPromo(data.promo);
        if (data.promo.type === 'percentage') {
          setDiscount((getCartTotal() * data.promo.discount) / 100);
        } else {
          setDiscount(data.promo.discount);
        }
        toast.success(`Promo "${data.promo.code}" applied!`);
      } else {
        toast.error(data.message || "Invalid promo code");
      }
    } catch (error) {
       toast.error("Failed to validate promo code");
    } finally {
      setValidatingPromo(false);
    }
  };

  async function handleShippingSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({ id: item.bikeId, quantity: item.quantity })),
          userEmail: session.user.email
        })
      });

      const data = await response.json();
      if (data.success) {
        setClientSecret(data.clientSecret);
        setIsMockPayment(!!data.isMock);
        setStep(2);
      } else {
        toast.error(data.message || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("Payment init error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentSuccess(paymentIntent) {
    setLoading(true);
    try {
      const orderData = {
        userEmail: session.user.email,
        items: cartItems.map(item => ({
          bikeId: item.bikeId,
          bikeName: item.bike.name,
          quantity: item.quantity,
          unitPrice: item.bike.price,
          subtotal: item.bike.price * item.quantity
        })),
        shippingAddress: { ...formData },
        paymentMethod: "stripe",
        paymentIntentId: paymentIntent.id,
        subtotal: getCartTotal(),
        tax: Math.max(0, (getCartTotal() - discount) * 0.1),
        shipping: 500,
        discount: discount,
        promoCode: appliedPromo?.code,
        total: Math.max(0, (getCartTotal() - discount) + ((getCartTotal() - discount) * 0.1) + 500)
      };

      const response = await fetch(`${API_URL}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        await clearCart();
        toast.success("Order placed successfully!");
        router.push(`/order-confirmation/${data.order.orderNumber}`);
      } else {
        toast.error(data.message || "Failed to save order");
      }
    } catch (error) {
      console.error("Finalize order error:", error);
      toast.error("An error occurred while saving your order");
    } finally {
      setLoading(false);
    }
  }

  if (!session || cartCount === 0) {
    return null;
  }

  const subtotal = getCartTotal();
  const tax = Math.max(0, (subtotal - discount) * 0.1);
  const shipping = 500;
  const total = (subtotal - discount) + tax + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/cart">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Complete your purchase</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 ? (
              <form onSubmit={handleShippingSubmit}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Full Name *</label>
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email *</label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Phone *</label>
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Street Address *</label>
                        <Input
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          required
                          placeholder="123 Main St"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">City *</label>
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">State *</label>
                        <Input
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          placeholder="NY"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">ZIP Code *</label>
                        <Input
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          required
                          placeholder="10001"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bike-gradient-alt text-white border-0 mt-6"
                      disabled={loading}
                    >
                      {loading ? "Initializing Payment..." : "Continue to Payment"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="gap-2 text-muted-foreground"
                       onClick={() => setStep(1)}
                     >
                       <ArrowLeft className="h-4 w-4" />
                       Edit Shipping
                     </Button>
                     <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">SECURE CHECKOUT</div>
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method Toggle */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`flex-1 p-3 sm:p-4 border-2 rounded-xl text-left transition-all ${
                        paymentMethod === 'stripe' 
                        ? 'border-purple-600 bg-purple-50 text-purple-900' 
                        : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-2 text-sm sm:text-base">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" /> Credit/Debit Card
                      </div>
                      <p className="text-[10px] sm:text-xs mt-1 text-slate-500">Secure payment via Stripe</p>
                    </button>
                    
                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={`flex-1 p-3 sm:p-4 border-2 rounded-xl text-left transition-all ${
                        paymentMethod === 'cod' 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900' 
                        : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-2 text-sm sm:text-base">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" /> Cash on Delivery
                      </div>
                      <p className="text-[10px] sm:text-xs mt-1 text-slate-500">Pay when you receive</p>
                    </button>
                  </div>

                  {paymentMethod === 'stripe' ? (
                    <>
                      <StripeProvider clientSecret={clientSecret} isMock={isMockPayment}>
                         <CheckoutForm 
                           amount={total} 
                           onPaymentSuccess={handlePaymentSuccess} 
                           isMock={isMockPayment}
                         />
                      </StripeProvider>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800 leading-relaxed">
                          🔒 Your payment is processed securely by Stripe.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4" /> Cash on Delivery Selected
                        </h4>
                        <p className="text-sm text-emerald-700">
                          You will pay <strong>${total.toLocaleString()}</strong> in cash when your order is delivered.
                        </p>
                        <p className="text-xs text-emerald-600 mt-2">
                          Note: Please have exact change ready if possible.
                        </p>
                      </div>
                      <Button 
                        size="lg" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handlePaymentSuccess({ id: 'cod_payment' })} // Pass mock ID for COD
                        disabled={loading}
                      >
                        {loading ? "Placing Order..." : "Place Order (Pay on Delivery)"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 border-0">
            <Card className="lg:sticky top-24 border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-slate-900 px-6 py-4 text-white">
                <h2 className="text-xl font-bold italic tracking-wider flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  ORDER SUMMARY
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800 uppercase tracking-tight line-clamp-1">{item.bike.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">QTY: {item.quantity} x ${item.bike.price.toLocaleString()}</p>
                      </div>
                      <span className="text-sm font-black text-slate-900">${(item.bike.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-bold font-mono">${subtotal.toLocaleString()}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span className="font-bold italic">Promo Discount ({appliedPromo?.code})</span>
                      <span className="font-bold font-mono">-${discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-slate-600">
                    <span className="font-medium">Estimated Tax (10%)</span>
                    <span className="font-bold font-mono">${tax.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-slate-600">
                    <span className="font-medium">Shipping & Handling</span>
                    <span className="font-bold font-mono">${shipping.toLocaleString()}</span>
                  </div>

                  <div className="pt-4 border-t-2 border-slate-900 mt-4 flex justify-between items-center">
                    <span className="text-lg font-black italic text-slate-900 uppercase">Grand Total</span>
                    <span className="text-2xl font-black text-purple-600 font-mono tracking-tighter">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Promo Input Overlay */}
                <div className="mt-6 pt-2 border-t border-dashed border-slate-200">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PROMOTIONAL CODE</span>
                   </div>
                   <div className="flex gap-2">
                      <Input 
                        placeholder="CODE" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={appliedPromo || validatingPromo}
                        className="bg-slate-50 uppercase font-bold text-xs border-slate-200 focus:bg-white"
                      />
                      <Button 
                        onClick={handleApplyPromo}
                        disabled={!promoCode || appliedPromo || validatingPromo}
                        className={`font-bold text-xs uppercase ${appliedPromo ? 'bg-emerald-500' : 'bg-slate-900'} text-white border-0`}
                      >
                        {validatingPromo ? "..." : (appliedPromo ? "✓" : "Apply")}
                      </Button>
                   </div>
                   {appliedPromo && (
                     <p className="text-[10px] text-emerald-600 mt-2 font-bold italic">
                        {appliedPromo.description}
                     </p>
                   )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
