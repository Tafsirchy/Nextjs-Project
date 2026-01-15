import { API_URL } from "@/lib/api";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCartItems(data.cartItems || []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, [session?.user?.email]);

  // Load cart from API on mount
  useEffect(() => {
    if (session?.user) {
      loadCart();
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [session, loadCart]);

  // Update cart count when items change
  useEffect(() => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  }, [cartItems]);

  async function addToCart(bike, quantity = 1) {
    if (!session?.user) {
      toast.error('Please login to add items to cart');
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}`
        },
        body: JSON.stringify({
          bikeId: bike.id,
          quantity,
          userEmail: session.user.email
        })
      });

      const data = await response.json();

      if (data.success) {
        await loadCart(); // Reload cart from server
        toast.success(`${bike.name} added to cart!`);
        return true;
      } else {
        toast.error(data.message || 'Failed to add to cart');
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function removeFromCart(bikeId) {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cart/remove/${bikeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.user.email}`
        }
      });

      const data = await response.json();

      if (data.success) {
        await loadCart();
        toast.success('Item removed from cart');
        return true;
      } else {
        toast.error(data.message || 'Failed to remove item');
        return false;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(bikeId, quantity) {
    if (quantity < 1) {
      return removeFromCart(bikeId);
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cart/update/${bikeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}`
        },
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();

      if (data.success) {
        await loadCart();
        return true;
      } else {
        toast.error(data.message || 'Failed to update quantity');
        return false;
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function clearCart() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.user.email}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setCartItems([]);
        toast.success('Cart cleared');
        return true;
      } else {
        toast.error(data.message || 'Failed to clear cart');
        return false;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }

  function getCartTotal() {
    return cartItems.reduce((sum, item) => {
      return sum + (item.bike.price * item.quantity);
    }, 0);
  }

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    refreshCart: loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
