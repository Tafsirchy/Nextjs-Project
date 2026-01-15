import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Star, ArrowRight, Heart, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWishlist } from "@/contexts/WishlistContext";

export default function BikeCard({ bike, showMoveToCart = false, onMoveToCart }) {
  const { data: session } = useSession();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const isDealer = session?.user?.role === 'dealer';
  const isWishlisted = isInWishlist(bike.id);

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      {/* ... existing image div ... */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={bike.image}
          alt={bike.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {bike.featured && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold">
            Featured
          </div>
        )}
        {isDealer && (
          <div className="absolute bottom-4 left-4">
            <div className="px-3 py-1 rounded-full bg-green-600 text-white text-xs font-bold shadow-lg">
              10-25% OFF
            </div>
          </div>
        )}
        <div className="absolute top-4 right-4 flex flex-row items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
            {bike.category}
          </div>
          <button
            onClick={() => toggleWishlist(bike.id)}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
              isWishlisted 
                ? "bg-red-500 text-white" 
                : "bg-white/70 text-gray-900 hover:bg-white"
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      <CardHeader>
        <div className="space-y-2">
          <h3 className="text-xl font-bold leading-tight line-clamp-1">{bike.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{bike.rating}</span>
            <span className="text-sm text-muted-foreground ml-1">({bike.stock} in stock)</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {bike.description}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Engine:</span>
            <span className="font-medium ml-1">{bike.engine}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Power:</span>
            <span className="font-medium ml-1">{bike.power}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-6 border-t font-sans">
        <div className="flex items-center justify-between w-full">
          <div>
            <div className="text-2xl font-bold text-purple-600">
              ${bike.price.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {isDealer ? 'Base price' : 'Starting price'}
            </div>
          </div>
          <Link href={`/bikes/${bike.id}`}>
            <Button className="gap-2 bike-gradient-alt text-white border-0">
              Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {showMoveToCart && (
          <Button 
            variant="outline" 
            className="w-full gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700 text-purple-600 font-bold"
            onClick={() => onMoveToCart(bike)}
          >
            <ShoppingCart className="h-4 w-4" />
            Move to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
