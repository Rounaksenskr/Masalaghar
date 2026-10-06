import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf8f5] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4 text-2xl">
            🛍️
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-stone-900 mb-2">
            Your Cart is Waiting
          </h2>
          <p className="text-xs text-stone-500 mb-6">
            Please log in to your Customer account to view and manage your shopping cart.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition"
            >
              Sign In to View Cart
            </Link>
            <Link
              to="/products"
              className="block w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf8f5] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-10 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4 text-3xl">
            🧺
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-stone-900 mb-2">
            Your Basket is Empty
          </h2>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            You haven't added any authentic spices, masala blends, or organic seeds yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition shadow-sm"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const deliveryFee = cart.total > 500 ? 0 : 40;
  const grandTotal = cart.total + deliveryFee;

  return (
    <div className="min-h-screen bg-[#faf8f5] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif-display text-3xl font-extrabold text-stone-900">
              Shopping Basket
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              You have {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
          >
            Clear Entire Cart
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="w-20 h-20 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      {item.product?.category}
                    </span>
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-bold text-stone-900 hover:text-amber-800 transition text-sm sm:text-base line-clamp-1"
                    >
                      {item.product?.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-extrabold text-stone-900">
                        ₹{item.effectivePrice}
                      </span>
                      {item.product?.discount > 0 && (
                        <span className="text-xs text-stone-400 line-through">
                          ₹{item.unitPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-stone-600 hover:bg-stone-200 transition"
                      disabled={loading}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 font-bold text-xs text-stone-900 min-w-[32px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-stone-600 hover:bg-stone-200 transition"
                      disabled={loading || (item.product && item.quantity >= item.product.stock)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right min-w-[70px]">
                    <span className="font-extrabold text-stone-900 text-sm block">
                      ₹{item.itemTotal}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline pt-2"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sticky Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm sticky top-24">
            <h2 className="font-serif-display text-xl font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-stone-900">₹{cart.subtotal}</span>
              </div>

              {cart.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Spice Discount Savings</span>
                  <span className="font-bold">-₹{cart.totalDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Delivery Charges</span>
                <span className="font-bold text-stone-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-extrabold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              {deliveryFee > 0 && (
                <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg">
                  💡 Add ₹{500 - cart.total} more of organic spices to unlock <strong>FREE Delivery</strong>!
                </p>
              )}

              <div className="pt-3 border-t border-stone-100 flex justify-between text-sm">
                <span className="font-extrabold text-stone-900">Grand Total</span>
                <span className="font-extrabold text-amber-900 text-lg">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow transition flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-stone-400 text-center mt-4">
              🔒 Safe & Secure 256-bit encrypted checkout with Razorpay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
