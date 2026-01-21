import Link from "next/link";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Star, Heart, Gauge, Zap, ShoppingCart, ArrowRight, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useState } from "react";
import QuickViewModal from "./QuickViewModal";

export default function BikeCard({ bike, showMoveToCart = false, onMoveToCart }) {
  const { data: session } = useSession();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [showQuickView, setShowQuickView] = useState(false);
  
  const isDealer = session?.user?.role === 'dealer';
  const isWishlisted = isInWishlist(bike.id);

  return (
    <Card className="overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 group border-slate-100 h-full flex flex-col">
      {/* Image Section - Compact h-48 */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Link href={`/bikes/${bike.id}`} className="block h-full w-full">
          <img
            src={bike.image}
            alt={bike.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {bike.featured && (
            <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[#000080] text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Featured
            </span>
          )}
          {isDealer && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Deal
            </span>
          )}
        </div>

        {/* Floating Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(bike.id);
            }}
            className={`h-8 w-8 flex items-center justify-center rounded-full backdrop-blur-md shadow-sm transition-all duration-300 ${
              isWishlisted 
                ? "bg-red-500 text-white" 
                : "bg-white/90 text-slate-700 hover:bg-white"
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowQuickView(true);
            }}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:bg-white shadow-sm transition-all duration-300"
            aria-label="Quick View"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
        
        {/* Category Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
           <span className="text-white text-xs font-medium px-2 py-1 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm">
            {bike.category}
           </span>
        </div>
      </div>

      {/* Content Section - Compact Padding */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/bikes/${bike.id}`} className="group-hover:text-purple-700 transition-colors">
            <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1" title={bike.name}>
              {bike.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-600">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs font-bold">{bike.rating || "New"}</span>
          </div>
        </div>

        {/* Compact Specs */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            <span>{bike.engine}</span>
          </div>
          <div className="w-px h-3 bg-slate-200"></div>
          <div className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" />
            <span>{bike.power}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-50">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
              {isDealer ? 'Dealer Price' : 'Starting From'}
            </p>
            <div className="text-xl font-extrabold text-[#000080]">
              ${bike.price.toLocaleString()}
            </div>
          </div>
          
          {showMoveToCart ? (
            <Button 
              size="sm"
              variant="outline"
              className="h-9 px-3 border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={() => onMoveToCart(bike)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" /> Cart
            </Button>
          ) : (
             <Link href={`/bikes/${bike.id}`}>
              <Button size="sm" className="h-9 w-9 p-0 rounded-full bike-gradient-alt text-white shadow-md hover:shadow-lg transition-all hover:scale-105">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Quick View Modal */}
      <QuickViewModal 
        bike={bike} 
        open={showQuickView} 
        onOpenChange={setShowQuickView} 
      />
    </Card>
  );
}
