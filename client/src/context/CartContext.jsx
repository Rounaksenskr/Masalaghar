import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isCustomer } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    totalDiscount: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Fetch cart from backend whenever customer user is active
  const fetchCart = useCallback(async () => {
    if (!user || !isCustomer) {
      setCart({ items: [], itemCount: 0, subtotal: 0, totalDiscount: 0, total: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isCustomer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      showNotification('Please login as Customer to add items to cart.', 'error');
      return false;
    }
    if (!isCustomer) {
      showNotification('Vendors cannot place orders. Please switch to a Customer account.', 'error');
      return false;
    }

    try {
      const res = await api.post('/cart', { productId, quantity });
      setCart(res.data.cart);
      showNotification(res.data.message || 'Added to cart!', 'success');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart.';
      showNotification(msg, 'error');
      return false;
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      setCart(res.data.cart);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity.';
      showNotification(msg, 'error');
      return false;
    }
  };

  // Remove single item from cart
  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      setCart(res.data.cart);
      showNotification('Item removed from cart.', 'info');
      return true;
    } catch (err) {
      showNotification('Failed to remove item.', 'error');
      return false;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [], itemCount: 0, subtotal: 0, totalDiscount: 0, total: 0 });
      return true;
    } catch (err) {
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cart.itemCount || 0,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
        notification,
      }}
    >
      {children}
      {/* Global floating toast notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${
              notification.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200'
                : notification.type === 'info'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            <span>{notification.type === 'error' ? '⚠️' : '🌿'}</span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
