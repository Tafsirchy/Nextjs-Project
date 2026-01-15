"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    async function fetchOrder() {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderNumber}`, {
          headers: {
            'Authorization': `Bearer ${session.user.email}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setOrder(data.order);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderNumber, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-2">
              Thank you for your purchase! Your order has been successfully placed.
            </p>
            <p className="text-sm text-muted-foreground">
              Order Number: <span className="font-semibold text-purple-600">{order.orderNumber}</span>
            </p>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold">Order Summary</h2>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                      <p className="font-semibold">{item.bikeName}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × ${item.unitPrice.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-semibold text-purple-600">
                      ${item.subtotal.toLocaleString()}
                    </p>
                  </div>
                ))}

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>${order.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>${order.shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-purple-600">${order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-bold">Shipping Address</h2>
              </div>
              <div className="text-muted-foreground">
                <p className="font-semibold text-foreground">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                <p>Email: {order.shippingAddress.email}</p>
              </div>
            </Card>

            {/* Payment & Delivery */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-bold">Payment</h2>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <p>Method: <span className="font-semibold text-foreground">Credit Card</span></p>
                  <p>Status: <span className="font-semibold text-green-600">Paid</span></p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-bold">Delivery</h2>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <p>Status: <span className="font-semibold text-blue-600">{order.status}</span></p>
                  <p>
                    Estimated Delivery:{" "}
                    <span className="font-semibold text-foreground">
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href="/bikes" className="flex-1">
                <Button size="lg" className="w-full bike-gradient-alt text-white border-0 gap-2">
                  Continue Shopping
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/my-orders" className="flex-1">
                <Button size="lg" variant="outline" className="w-full">
                  View My Orders
                </Button>
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4">
              <p>A confirmation email has been sent to {order.shippingAddress.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
