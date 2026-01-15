"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Calendar, DollarSign, Eye, ShoppingBag } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function MyOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    async function fetchOrders() {
      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${session.user.email}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [session, router]);

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  function getStatusColor(status) {
    const colors = {
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-yellow-100 text-yellow-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track and manage your orders
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="mb-8">
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
            <p className="text-muted-foreground mb-8">
              You haven&apos;t placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link href="/bikes">
              <Button size="lg" className="bike-gradient-alt text-white border-0">
                Browse Bikes
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    {/* Items Preview */}
                    <div className="space-y-2 mb-4">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {item.bikeName} × {item.quantity}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-sm text-muted-foreground">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>

                    {/* Delivery Info */}
                    {order.estimatedDelivery && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Estimated Delivery:</strong>{" "}
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3">
                      <div className="text-right mb-1 sm:mb-0 lg:mb-1">
                        <div className="text-sm text-muted-foreground">Total Amount</div>
                        <div className="text-2xl font-bold text-purple-600">
                          ${order.total.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        {['confirmed', 'processing'].includes(order.status) && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancel(order.orderNumber)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Link href={`/my-orders/${order.orderNumber}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );

  async function handleCancel(orderNumber) {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/orders/status/${orderNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order cancelled successfully");
        // Update local state
        setOrders(prev => prev.map(o => 
          o.orderNumber === orderNumber ? { ...o, status: 'cancelled' } : o
        ));
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("An error occurred");
    }
  }
}
