import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, X, RefreshCw } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/customer/ProductCard';

const categories = [
  'All',
  'Spices',
  'Whole spices',
  'Masala',
  'Organic seeds',
  'Herbs',
  'Vegetables',
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchInput, setSearchInput] = useState(initialSearch);

  // Sync category changes with query string
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'All');
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch products whenever category or search param changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        if (searchInput.trim()) {
          params.search = searchInput.trim();
        }

        const res = await api.get('/products', { params });
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchInput]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      searchParams.set('search', searchInput.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Direct from Regional Mills & Farms
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-stone-900">
            Marketplace Catalog
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Showing unadulterated whole spices, stone-ground blends, and organic agricultural seeds.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 mb-8 shadow-sm">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-5 max-w-xl">
            <input
              type="text"
              placeholder="Search by spice name (e.g., Turmeric, Cardamom, Cloves, Seeds)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 bg-stone-50 focus:bg-white"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900 transition"
            >
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-2 hidden sm:inline flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active Filter Indicators */}
          {(selectedCategory !== 'All' || searchInput) && (
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <span>Active filters:</span>
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 font-semibold border border-amber-200">
                    Category: {selectedCategory}
                  </span>
                )}
                {searchInput && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-semibold">
                    "{searchInput}"
                  </span>
                )}
              </div>
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          )}
        </div>

        {/* Product Grid / Loading / Empty States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Showing {products.length} {products.length === 1 ? 'Product' : 'Products'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="font-serif-display text-xl font-bold text-stone-800 mb-2">
              No Spices Found
            </h3>
            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              We couldn't find any products matching your criteria. Try adjusting the search term or category filter.
            </p>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
