"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import BikeCard from "@/components/BikeCard";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { wishlist, loading, wishlistCount, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [movingItems, setMovingItems] = useState({});

  useEffect(() => {
    if (!session) {
      router.push("/login?callbackUrl=/wishlist");
    }
  }, [session, router]);

  const handleMoveToCart = async (bike) => {
    setMovingItems(prev => ({ ...prev, [bike.id]: true }));
    try {
      const success = await addToCart(bike, 1);
      if (success) {
        // Remove from wishlist after moving to cart
        await toggleWishlist(bike.id);
        toast.success("Moved to cart!");
      }
    } catch (error) {
      console.error("Error moving to cart:", error);
      toast.error("Failed to move item");
    } finally {
      setMovingItems(prev => ({ ...prev, [bike.id]: false }));
    }
  };

  if (!session) return null;

  if (loading) {
// ... existing loading div ...
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {wishlistCount === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="mb-8 p-6 bg-white rounded-full inline-block shadow-sm">
              <Heart className="h-24 w-24 mx-auto text-muted-foreground opacity-30" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h2>
            <p className="text-muted-foreground mb-8">
              Found something you like? Click the heart icon on any bike to save it here.
            </p>
            <Link href="/bikes">
              <Button size="lg" className="bike-gradient-alt text-white border-0 gap-2">
                Browse Bikes
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map((item) => (
              <BikeCard 
                key={item.id} 
                bike={item.bike} 
                showMoveToCart={true}
                onMoveToCart={handleMoveToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
