"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

export default function QuickViewModal({ bike, open, onOpenChange }) {
  const router = useRouter();
  const { addToCart, loading } = useCart();

  if (!bike) return null;

  const handleAddToCart = async () => {
    const success = await addToCart(bike, 1);
    if (success) {
      // Close modal after successful add
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        {/* Accessible title for screen readers */}
        <DialogTitle className="sr-only">Quick View: {bike.name}</DialogTitle>
        
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 rounded-full p-2 bg-white/90 hover:bg-white shadow-lg transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
            <img
              src={bike.image || bike.imageUrl || '/placeholder-bike.jpg'}
              alt={bike.name}
              className="w-full h-auto object-contain max-h-[400px]"
            />
            {bike.featured && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                FEATURED
              </div>
            )}
            {bike.onSale && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                ON SALE
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-8 flex flex-col">
            <div className="flex-1">
              <div className="mb-4">
                <span className="text-xs font-semibold text-[#000080] uppercase tracking-wider">{bike.category}</span>
                <h2 className="text-3xl font-bold text-slate-900 mt-1">{bike.name}</h2>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-extrabold text-[#000080]">${bike.price?.toLocaleString()}</span>
                {bike.onSale && bike.originalPrice && (
                  <span className="text-lg text-slate-400 line-through">${bike.originalPrice?.toLocaleString()}</span>
                )}
              </div>

              <div className="mb-6">
                <p className="text-slate-600 leading-relaxed line-clamp-3">{bike.description}</p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {bike.engine && (
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Engine</span>
                    <span className="text-sm font-bold text-slate-900">{bike.engine}</span>
                  </div>
                )}
                {bike.year && (
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Year</span>
                    <span className="text-sm font-bold text-slate-900">{bike.year}</span>
                  </div>
                )}
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Stock</span>
                  <span className={`text-sm font-bold ${(bike.inStock !== false && bike.stock !== 0) ? 'text-green-600' : 'text-red-600'}`}>
                    {(bike.inStock !== false && bike.stock !== 0) ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button
                onClick={handleAddToCart}
                disabled={bike.inStock === false || bike.stock === 0 || loading}
                className="flex-1 bg-[#000080] hover:bg-blue-900 text-white flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {loading ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button
                onClick={() => {
                  router.push(`/bikes/${bike.id}`);
                  onOpenChange(false);
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Full Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
