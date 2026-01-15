"use client";

import { API_URL } from "@/lib/api";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${session.user.email}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (bikeId) => {
    if (!session) {
      toast.error("Please login to save to wishlist");
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.email}`
        },
        body: JSON.stringify({ bikeId })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchWishlist();
        toast.success(data.message || "Added to wishlist");
        return true;
      } else {
        toast.error(data.message || "Failed to add to wishlist");
        return false;
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("An error occurred");
      return false;
    }
  };

  const removeFromWishlist = async (bikeId) => {
    if (!session) return false;

    try {
      const response = await fetch(`${API_URL}/api/wishlist/remove/${bikeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.user.email}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setWishlist(prev => prev.filter(item => item.bikeId !== bikeId));
        toast.success("Removed from wishlist");
        return true;
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("An error occurred");
    }
    return false;
  };

  const isInWishlist = (bikeId) => {
    return wishlist.some(item => item.bikeId === bikeId);
  };

  const toggleWishlist = async (bikeId) => {
    if (isInWishlist(bikeId)) {
      return await removeFromWishlist(bikeId);
    } else {
      return await addToWishlist(bikeId);
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      loading, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist,
      toggleWishlist,
      wishlistCount: wishlist.length 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
