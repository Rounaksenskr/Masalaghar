import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../services/api';

const categories = [
  'Spices',
  'Whole spices',
  'Masala',
  'Organic seeds',
  'Herbs',
  'Vegetables',
];

const sampleImagePresets = [
  { label: 'Turmeric', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Red Chilli', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cardamom', url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Biryani Masala', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Seeds', url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80' },
];

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Spices',
    price: '',
    discount: '0',
    stock: '25',
    image: sampleImagePresets[0].url,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.description || !formData.price || !formData.stock) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/products', {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount || 0),
        stock: parseInt(formData.stock, 10),
      });

      navigate('/vendor/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <Link
          to="/vendor/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-amber-800 transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Products
        </Link>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm">
          <div className="mb-8 pb-4 border-b border-stone-100">
            <h1 className="font-serif-display text-2xl sm:text-3xl font-extrabold text-stone-900">
              List a New Spice Product
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Add products to your vendor catalog. The product will immediately appear in the marketplace.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                placeholder="e.g. Stone-Ground Salem Turmeric Powder (250g)"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Initial Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Price in INR (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="1"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  placeholder="e.g. 199"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Discount % (Optional)</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  placeholder="e.g. 10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Product Description *</label>
              <textarea
                required
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                placeholder="Describe aroma, origin estate, mesh size, culinary use..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">Image URL *</label>
                <span className="text-[11px] text-stone-400">Sample presets available</span>
              </div>
              <input
                type="url"
                required
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none mb-2"
                placeholder="https://..."
              />

              {/* Sample preset buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Presets:</span>
                {sampleImagePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, image: preset.url })}
                    className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <Link
                to="/vendor/products"
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                {loading ? 'Listing Product...' : 'Publish to Marketplace'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
