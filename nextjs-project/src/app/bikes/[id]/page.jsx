"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { fetchBikeById } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Gauge, Zap, Weight, Palette, CheckCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import BikeReviews from "@/components/BikeReviews";

export default function BikeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { addToCart, loading: cartLoading } = useCart();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [pricing, setPricing] = useState(null);

  const loadBike = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBikeById(params.id);
      if (data.success && data.bike) {
        setBike(data.bike);
        setError(null);
      } else {
        setError("Bike not found");
      }
    } catch (err) {
      console.error("Error loading bike:", err);
      setError("Failed to load bike details");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchPricing = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/pricing/${bike.id}?quantity=${quantity}`,
        {
          headers: session?.user?.email 
            ? { 'Authorization': `Bearer ${session.user.email}` }
            : {}
        }
      );
      const data = await response.json();
      if (data.success) {
        setPricing(data.pricing);
      }
    } catch (error) {
      console.error("Error fetching pricing:", error);
    }
  }, [bike?.id, quantity, session?.user?.email]);

  useEffect(() => {
    if (params.id) {
      loadBike();
    }
  }, [params.id, loadBike]);

  // Fetch pricing when quantity or session changes
  useEffect(() => {
    if (bike && session) {
      fetchPricing();
    }
  }, [bike, session, fetchPricing]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading bike details...</p>
        </div>
      </div>
    );
  }

  if (error || !bike) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Bike not found"}</h1>
          <Link href="/bikes">
            <Button>Back to Bikes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/bikes">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Bikes
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl">
              <Image
                src={bike.image}
                alt={bike.name}
                width={800}
                height={500}
                className="w-full h-[500px] object-cover"
                priority
              />
              {bike.featured && (
                <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold">
                  Featured Bike
                </div>
              )}
              <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm text-white text-sm font-medium">
                {bike.category}
              </div>
            </div>

            {/* Available Colors */}
            {bike.colors && bike.colors.length > 0 && (
              <div className="p-6 rounded-xl bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">Available Colors</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bike.colors.map((color, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{bike.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(bike.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-medium">{bike.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {bike.stock} in stock
                </span>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {bike.description}
              </p>
            </div>

            {/* Price */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              {pricing && pricing.userRole === 'dealer' && pricing.discountPercent > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Dealer Price</div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                      {pricing.discountPercent}% OFF
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <div className="text-4xl font-bold">${pricing.unitPrice.toLocaleString()}</div>
                    <div className="text-lg line-through opacity-70">${bike.price.toLocaleString()}</div>
                  </div>
                  <div className="text-sm opacity-90">
                    {pricing.tier} • Save ${pricing.discount.toLocaleString()} per unit
                  </div>
                  {quantity > 1 && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span>Total ({quantity} units):</span>
                        <span className="font-bold">${pricing.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Total Savings:</span>
                        <span className="font-bold text-green-200">${pricing.savings.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-sm font-medium mb-1">Price</div>
                  <div className="text-4xl font-bold">${bike.price.toLocaleString()}</div>
                  {session?.user?.role === 'dealer' && (
                    <div className="mt-2 text-sm opacity-90">
                      💎 Dealer discounts available (10-25% off)
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Specifications */}
            <div className="p-6 rounded-xl bg-white shadow-sm space-y-4">
              <h3 className="text-xl font-semibold mb-4">Key Specifications</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Gauge className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <div className="text-sm text-muted-foreground">Engine</div>
                    <div className="font-semibold">{bike.engine}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <div className="text-sm text-muted-foreground">Power</div>
                    <div className="font-semibold">{bike.power}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Gauge className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <div className="text-sm text-muted-foreground">Top Speed</div>
                    <div className="font-semibold">{bike.topSpeed}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Weight className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <div className="text-sm text-muted-foreground">Weight</div>
                    <div className="font-semibold">{bike.weight}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {bike.features && bike.features.length > 0 && (
              <div className="p-6 rounded-xl bg-white shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bike.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to Cart Section */}
            <div className="space-y-4 pt-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="px-6 py-2 border-x font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(bike.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= bike.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="flex-1 bike-gradient-alt text-white border-0 gap-2"
                  onClick={async () => {
                    const success = await addToCart(bike, quantity);
                    if (success) {
                      setQuantity(1); // Reset quantity
                    }
                  }}
                  disabled={cartLoading || bike.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {bike.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Link href="/cart" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full">
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <BikeReviews bikeId={params.id} />
      </div>
    </div>
  );
}
