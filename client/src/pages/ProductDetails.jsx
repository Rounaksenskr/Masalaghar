import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Check, ShieldCheck, Truck, RefreshCcw, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Loading harvest details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#faf8f5] py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl border border-stone-200">
          <span className="text-4xl block mb-3">🌿</span>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Product Not Found</h2>
          <p className="text-xs text-stone-500 mb-6">This spice may have been removed or does not exist.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const originalPrice = product.price;
  const discount = product.discount || 0;
  const finalPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;
    setAdding(true);
    const success = await addToCart(product.id, quantity);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-amber-800 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Products
        </Link>

        {/* Main Product Card */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-10">
            
            {/* Image Column */}
            <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-md">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Details Column */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Category, Origin & Vendor */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {product.category}
                    </span>
                    {product.unit && (
                      <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        ⚖️ {product.unit}
                      </span>
                    )}
                  </div>

                  {product.origin && (
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                      📍 Harvested in {product.origin}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-serif-display text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug mb-1">
                  {product.name}
                </h1>

                {product.vendor && (
                  <p className="text-xs font-semibold text-stone-500 mb-4 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 inline" />
                    Milled and verified by {product.vendor.name} {product.vendor.address ? `(${product.vendor.address.split(',').slice(-2).join(',')})` : ''}
                  </p>
                )}

                {/* Pricing Block */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-extrabold text-stone-900">
                    ₹{finalPrice}
                  </span>
                  {discount > 0 && (
                    <span className="text-lg text-stone-400 line-through">
                      ₹{originalPrice}
                    </span>
                  )}
                  <span className="text-xs text-stone-500 font-medium">
                    (inclusive of all taxes)
                  </span>
                </div>

                {/* Description */}
                <div className="mb-6 pb-6 border-b border-stone-100">
                  <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider mb-2">Description</h3>
                  <p className="text-stone-700 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Stock Status */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-stone-400 tracking-wider block mb-1">
                      Availability
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        product.stock > 10
                          ? 'text-emerald-700'
                          : product.stock > 0
                          ? 'text-amber-700'
                          : 'text-red-600'
                      }`}
                    >
                      {product.stock > 10
                        ? `In Stock (${product.stock} units ready)`
                        : product.stock > 0
                        ? `Low Stock: Only ${product.stock} left`
                        : 'Currently Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls & Add to Cart */}
                {product.stock > 0 && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3.5 py-2 text-stone-700 hover:bg-stone-200 font-bold transition"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 font-bold text-sm text-stone-900 min-w-[40px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3.5 py-2 text-stone-700 hover:bg-stone-200 font-bold transition"
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm ${
                        added
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-800 hover:bg-amber-900 text-white'
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="w-4 h-4" /> Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          {adding ? 'Adding...' : 'Add to Cart'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-100 text-center">
                <div className="p-3 rounded-xl bg-stone-50">
                  <ShieldCheck className="w-5 h-5 text-amber-700 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-stone-800">100% Pure</p>
                  <p className="text-[10px] text-stone-500">No Preservatives</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50">
                  <Truck className="w-5 h-5 text-amber-700 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-stone-800">Fast Dispatch</p>
                  <p className="text-[10px] text-stone-500">Aroma Sealed</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50">
                  <RefreshCcw className="w-5 h-5 text-amber-700 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-stone-800">Fresh Batch</p>
                  <p className="text-[10px] text-stone-500">Milled Monthly</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Feedback Section */}
        <div className="mt-8 bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-stone-100">
            <div>
              <h2 className="font-serif-display text-2xl font-bold text-stone-900">
                Verified Customer Reviews
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Feedback from home cooks and chefs who cooked with this batch.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-bold text-sm border border-amber-200">
              <span>★ 5.0</span>
              <span className="text-xs text-stone-400 font-normal">({(product.reviews || []).length} reviews)</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {(product.reviews && product.reviews.length > 0) ? (
              product.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-stone-900">{rev.user?.name || 'Verified Buyer'}</span>
                    <span className="text-amber-600 font-bold">{'★'.repeat(rev.rating)}</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-stone-500">
                <p>No customer reviews for this specific harvest yet.</p>
                <p className="text-[11px] text-stone-400 mt-1">Be the first to order and review this spice!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
