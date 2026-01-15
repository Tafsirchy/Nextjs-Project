"use client";

import { API_URL } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function QuoteDetailsPage() {
  const { quoteId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuote = useCallback(async () => {
    try {
      // In a real app, we'd have a specific GET /api/quotes/:id endpoint.
      // For now, we'll fetch all and filter client-side or use a new endpoint if available.
      // Let's assume we can fetch it via the user's dashboard data or a new endpoint.
      // Implementing a simple fetching logic:
      const response = await fetch(`${API_URL}/api/quotes/my-quotes`, {
        headers: { 'Authorization': `Bearer ${session?.user?.email}` }
      });
      const data = await response.json();
      if (data.success) {
        // Find the specific quote
        const foundQuote = data.quotes.find(q => q.quoteId === quoteId || q.id === quoteId);
        if (foundQuote) {
          setQuote(foundQuote);
        } else {
          toast.error("Quote not found");
        }
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setLoading(false);
    }
  }, [quoteId, session]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchQuote();
    }
  }, [session, fetchQuote]);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div></div>;
  }

  if (!quote) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
        <Link href="/bikes"><Button>Return to Shop</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6 no-print">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      <Card className="border print:border-0 print:shadow-none">
        <CardHeader className="border-b bg-slate-50 print:bg-white text-center pb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-purple-700">MotruBi</h1>
              <p className="text-sm text-muted-foreground">Premium Motorcycles</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">DEALER QUOTE</h2>
              <p className="font-mono text-slate-500">#{quote.quoteId}</p>
            </div>
          </div>
          <div className="flex justify-between text-sm mt-4 text-left">
            <div>
              <p className="font-bold text-slate-700">Prepared For:</p>
              <p>{quote.dealerInfo?.name}</p>
              <p>{quote.dealerInfo?.email}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-700">Date Issued:</p>
              <p>{new Date(quote.createdAt).toLocaleDateString()}</p>
              <p className="font-bold text-slate-700 mt-2">Valid Until:</p>
              <p>{new Date(quote.expiresAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-slate-100 print:bg-slate-100 border-b">
              <tr>
                <th className="text-left p-4 font-bold text-slate-600">Item Description</th>
                <th className="text-center p-4 font-bold text-slate-600">Qty</th>
                <th className="text-right p-4 font-bold text-slate-600">Unit Price</th>
                <th className="text-right p-4 font-bold text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="p-4">
                    <p className="font-bold">{item.bike.name}</p>
                    <p className="text-xs text-slate-500">{item.bike.category} | {item.bike.engine}</p>
                  </td>
                  <td className="text-center p-4">{item.quantity}</td>
                  <td className="text-right p-4">${item.bike.price.toLocaleString()}</td>
                  <td className="text-right p-4 font-medium">${(item.bike.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 print:bg-slate-50">
              <tr>
                <td colSpan="3" className="text-right p-3 font-medium text-slate-500">Subtotal:</td>
                <td className="text-right p-3 font-bold">${quote.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-right p-3 font-medium text-slate-500">Tax (10%):</td>
                <td className="text-right p-3 font-medium text-slate-500">${quote.tax.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-slate-200">
                <td colSpan="3" className="text-right p-4 text-lg font-bold">Total Estimate:</td>
                <td className="text-right p-4 text-xl font-bold text-purple-700">${quote.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          
          <div className="p-8 border-t bg-slate-50 print:bg-white text-center text-sm text-muted-foreground">
            <p>This quote is valid for 30 days from the date of issuance. Subject to stock availability.</p>
            <p className="mt-2">For any questions, please contact support@motrubi.com</p>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center text-xs text-muted-foreground mt-8 no-print">
        Click &quot;Download PDF&quot; to save this quote.
      </p>
    </div>
  );
}
