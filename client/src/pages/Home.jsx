import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Award, ShieldCheck, Flame, Leaf, Package } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/customer/ProductCard';

const categories = [
  { name: 'Spices', icon: '🌶️', desc: 'Turmeric, Kashmiri chilli & jeera powders' },
  { name: 'Whole spices', icon: '🌿', desc: 'Cardamom pods, cloves & cinnamon quills' },
  { name: 'Masala', icon: '🍲', desc: 'Garam masala, biryani potli & curry mixes' },
  { name: 'Organic seeds', icon: '🌱', desc: 'Desi tomato, chilli & coriander seeds' },
  { name: 'Herbs', icon: '🍃', desc: 'Kasuri methi, holy tulsi & mint leaves' },
  { name: 'Vegetables', icon: '🥬', desc: 'Farm-fresh organic kitchen greens' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products');
        // Pick first 6 products as featured
        setFeaturedProducts(res.data.products.slice(0, 6));
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-white to-[#faf8f5] py-16 md:py-24 border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Pure Indian Spice Heritage
              </div>

              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-950 tracking-tight leading-[1.15]">
                Awaken Every Meal with Authentic <span className="text-amber-800 underline decoration-amber-400">Masalas</span> & Native Harvest.
              </h1>

              <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Stone-ground whole spices, hand-roasted masala blends, and chemical-free organic seeds sourced directly from generational spice planters across India.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/products"
                  className="px-6 py-3.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
                >
                  Explore All Spices <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/products?category=Masala"
                  className="px-6 py-3.5 rounded-xl bg-white border border-stone-300 hover:border-amber-700 text-stone-800 font-semibold text-sm shadow-sm transition"
                >
                  View Masala Blends
                </Link>
              </div>

              {/* Trust Micro-Metrics */}
              <div className="pt-6 border-t border-stone-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-extrabold text-amber-950">100%</p>
                  <p className="text-xs text-stone-500 font-medium">Stone-Ground</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-amber-950">Zero</p>
                  <p className="text-xs text-stone-500 font-medium">Synthetic Additives</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-amber-950">Direct</p>
                  <p className="text-xs text-stone-500 font-medium">Farmer Sourcing</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] lg:aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80"
                  alt="Assorted Indian Spices and Masalas"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                      Estate Harvest Batch
                    </span>
                    <h3 className="font-serif-display text-xl font-bold">Malabar & Khari Baoli Collections</h3>
                    <p className="text-xs text-stone-200 mt-1">Sun-dried without artificial polishes or dyes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif-display text-3xl font-bold text-stone-900">
            Browse by Culinary Category
          </h2>
          <p className="text-stone-600 text-sm mt-2">
            From single-origin whole pods to heritage seeds ready for your kitchen garden.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group p-5 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-2xl mb-3 transition">
                {cat.icon}
              </div>
              <h3 className="font-bold text-stone-900 group-hover:text-amber-800 text-sm">
                {cat.name}
              </h3>
              <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-tight">
                {cat.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-600" /> Handpicked Bestsellers
              </div>
              <h2 className="font-serif-display text-3xl font-bold text-stone-900">
                Freshly Milled Spice Collection
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-amber-900"
            >
              View Full Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-stone-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* The Masala Ghar Guarantee Banner */}
      <section className="py-20 bg-amber-950 text-amber-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-3xl mb-4 inline-block">🌿</span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Pure Spices Without Compromise
          </h2>
          <p className="text-amber-200/80 text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Most grocery store spices sit in warehouses for years losing volatile oils.
            At <strong>Masala Ghar</strong>, vendors grind in small batches using traditional stone chakkis
            so that aroma, color, and medicinal benefits reach your kitchen intact.
          </p>
          <div className="inline-flex gap-4">
            <Link
              to="/products"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm transition"
            >
              Shop Fresh Harvest
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
