"use client";

import { API_URL } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { cartItems, cartCount, loading, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [requestingQuote, setRequestingQuote] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Please login to view your cart</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground opacity-50" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Start adding bikes to your cart to see them here!
            </p>
            <Link href="/bikes">
              <Button size="lg" className="bike-gradient-alt text-white border-0 gap-2">
                Browse Bikes
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1; // 10% tax
  const shipping = 500; // Flat shipping
  const total = subtotal + tax + shipping;

  const handleRequestQuote = async () => {
    setRequestingQuote(true);
    try {
      const response = await fetch(`${API_URL}/api/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
             bikeId: item.bikeId,
             quantity: item.quantity,
             bike: item.bike
          })),
          userEmail: session.user.email,
          dealerInfo: { name: session.user.name, email: session.user.email }
        })
      });

      const data = await response.json();
    if (data.success) {
      toast.success(`Quote #${data.quote.quoteId} generated!`);
      // Redirect to the quote details page to view/print
      window.location.href = `/quotes/${data.quote.id}`;
    } else {
      toast.error(data.message || "Failed to generate quote");
    }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setRequestingQuote(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Image */}
                  <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0">
                    <img
                      src={item.bike.image}
                      alt={item.bike.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link href={`/bikes/${item.bike.id}`}>
                          <h3 className="text-xl font-semibold hover:text-purple-600 transition-colors">
                            {item.bike.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">{item.bike.category}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.bikeId)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2"
                        title="Remove from cart"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.bikeId, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-1 border-x font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.bikeId, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity >= item.bike.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          ${item.bike.price.toLocaleString()} each
                        </div>
                        <div className="text-xl font-bold text-purple-600">
                          ${(item.bike.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (10%)</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>${shipping.toLocaleString()}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-2xl font-bold text-purple-600">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full bike-gradient-alt text-white border-0 gap-2 mb-4">
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/bikes">
                <Button size="lg" variant="outline" className="w-full mb-4">
                  Continue Shopping
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                variant="secondary" 
                className="w-full mb-4 font-bold text-slate-600 gap-2 border-slate-200"
                onClick={handleRequestQuote}
                disabled={requestingQuote}
              >
                {requestingQuote ? "Generating..." : "Request Dealer Quote (PDF)"}
                <FileText className="h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
