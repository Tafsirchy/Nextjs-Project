"use client";

import { API_URL } from "@/lib/api";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Download, 
  Mail, 
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  FileText
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function OrderDetailsPage() {
  const { orderNumber } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders/${orderNumber}`, {
          headers: {
            'Authorization': `Bearer ${session.user.email}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          toast.error("Order not found");
          router.push("/my-orders");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber, session, router]);

  const handleDownloadInvoice = () => {
    // For now, we use the browser's print functionality which allows saving as PDF
    window.print();
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderNumber}/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.email}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Invoice sent to " + order.shippingAddress.email);
      } else {
        toast.error("Failed to send email");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending email");
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
          }
          
          /* Force smaller fonts for invoice header */
          .invoice-header h1 {
            font-size: 18px !important;
          }
          
          .invoice-header h2 {
            font-size: 14px !important;
          }
          
          .invoice-header p,
          .invoice-header span {
            font-size: 10px !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-slate-50 py-12 print:bg-white print:py-0">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
          <Link href="/my-orders">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to My Orders
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleDownloadInvoice}>
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
            <Button 
              className="bike-gradient-alt text-white border-0 gap-2" 
              onClick={handleSendEmail}
              disabled={sendingEmail}
            >
              <Mail className="h-4 w-4" />
              {sendingEmail ? "Sending..." : "Resend Email"}
            </Button>
          </div>
        </div>

        {/* Invoice Header (Visible in print) */}
        <div className="invoice-header hidden print:block mb-8 pb-6 border-b">
          <div className="flex justify-between items-start">
            <div className="w-1/2">
              <h1 className="text-2xl font-bold text-purple-600 mb-1">MotruBi</h1>
              <p className="text-xs text-muted-foreground">Premier Bike Ecosystem</p>
            </div>
            <div className="w-1/2 text-right">
              <h2 className="text-base font-bold uppercase mb-1">Invoice</h2>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold">Order #:</span>
              <span className="font-medium text-purple-600">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold">Date:</span>
              <span>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Tracking */}
            <Card className="overflow-hidden border-0 shadow-sm print:hidden">
               <div className={`p-4 flex items-center gap-3 ${
                 order.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-purple-50 text-purple-700'
               }`}>
                 {getStatusIcon(order.status)}
                 <div className="flex-1">
                   <div className="text-sm font-bold uppercase tracking-wider">Order {order.status}</div>
                   <div className="text-xs opacity-80">Last updated on {new Date(order.updatedAt || order.createdAt).toLocaleString()}</div>
                 </div>
               </div>
            </Card>

            {/* Order Items */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b bg-white">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {order.items.map((item, index) => (
                    <div key={index} className="p-4 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                           {/* Simplified item display for details */}
                           <FileText className="h-8 w-8 text-gray-300" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.bikeName}</div>
                          <div className="text-sm text-slate-500">
                             Quantity: <span className="font-medium text-slate-700">{item.quantity}</span> × ${item.unitPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">${item.subtotal.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Totals */}
                <div className="p-6 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (10%)</span>
                    <span>${order.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>${order.shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-4 border-t border-slate-200">
                    <span className="text-slate-900">Total</span>
                    <span className="text-purple-600">${order.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Note (Mock) */}
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 print:hidden">
              <p className="text-xs text-purple-800 leading-relaxed">
                <strong>Note:</strong> Thank you for choosing MotruBi! Your order is being picked up by our logistics partner. 
                Full tracking details will be available once the status changes to &quot;shipped&quot;.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <Card className="border-0 shadow-sm overflow-hidden">
               <CardHeader className="bg-slate-900 text-white p-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-4 space-y-2 text-sm">
                  <div className="font-bold text-slate-900">{order.shippingAddress.fullName}</div>
                  <div className="text-slate-600">{order.shippingAddress.street}</div>
                  <div className="text-slate-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                  <div className="text-slate-600">{order.shippingAddress.country}</div>
                  <div className="pt-2 border-t mt-2">
                     <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Contact Info</div>
                     <div className="text-slate-700 break-all">{order.shippingAddress.phone}</div>
                     <div className="text-slate-700 break-all text-xs">{order.shippingAddress.email}</div>
                  </div>
               </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="border-0 shadow-sm overflow-hidden">
               <CardHeader className="bg-slate-900 text-white p-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Details
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Method:</span>
                    <span className="font-bold text-slate-900 capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-tight">
                       {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Estimated Delivery:</span>
                    <span className="font-bold text-slate-900">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                  </div>
               </CardContent>
            </Card>

            {/* Help / Support Card (Mock) */}
            <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0 shadow-sm print:hidden">
               <CardContent className="p-6 text-center">
                  <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold mb-1">Need help?</h3>
                  <p className="text-xs text-white/80 mb-4">Our support team is available 24/7 for any questions regarding your order.</p>
                  <Button variant="secondary" size="sm" className="w-full text-indigo-700 font-bold">
                    Contact Support
                  </Button>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Print-only Footer */}
      <div className="hidden print:block mt-12 pt-8 border-t text-center text-xs text-muted-foreground bg-white">
        <p className="break-words">MotruBi Premier Bike Ecosystem • 123 Bike Lane, Cycle City, CC 12345 • contact@motrubi.com</p>
        <p className="mt-1">© {new Date().getFullYear()} MotruBi. All rights reserved.</p>
      </div>
    </div>
    </>
  );
}
