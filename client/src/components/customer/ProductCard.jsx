import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const originalPrice = product.price;
  const discount = product.discount || 0;
  const finalPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    setAdding(true);
    const success = await addToCart(product.id, 1);
    setAdding(false);

    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 hover:border-amber-400 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image & Badges */}
      <Link to={`/products/${product.id}`} className="relative block w-full pt-[75%] overflow-hidden bg-stone-100">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-950 uppercase tracking-wider shadow-sm">
          {product.category}
        </span>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-600 text-white px-2 py-0.5 rounded-full text-[11px] font-extrabold shadow-sm">
            {discount}% OFF
          </span>
        )}

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-stone-900 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Vendor & Origin metadata */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            {product.vendor && (
              <span className="text-amber-800 font-semibold flex items-center gap-1 truncate">
                <Sparkles className="w-3 h-3 text-amber-600 inline flex-shrink-0" />
                {product.vendor.name}
              </span>
            )}
            {product.origin && (
              <span className="text-stone-400 font-medium text-[10px] bg-stone-100 px-2 py-0.5 rounded-md">
                📍 {product.origin.split(',')[0]}
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link to={`/products/${product.id}`}>
            <h3 className="font-bold text-stone-900 group-hover:text-amber-800 transition line-clamp-1 text-base">
              {product.name}
            </h3>
          </Link>

          {/* Unit & Description */}
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {product.unit && <span className="font-bold text-stone-700 mr-1.5">[{product.unit}]</span>}
            {product.description}
          </p>
        </div>

        {/* Pricing & Stock */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-stone-900">
                ₹{finalPrice}
              </span>
              {discount > 0 && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>

            {/* Stock pill */}
            <span
              className={`text-[11px] font-semibold ${
                product.stock > 10
                  ? 'text-emerald-700'
                  : product.stock > 0
                  ? 'text-amber-700'
                  : 'text-red-600'
              }`}
            >
              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Sold out'}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || adding}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 ${
              added
                ? 'bg-emerald-600 text-white'
                : product.stock <= 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-amber-800 hover:bg-amber-900 text-white shadow-sm hover:shadow'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                {adding ? 'Adding...' : 'Add to Cart'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
