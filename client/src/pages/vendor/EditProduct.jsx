import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const categories = [
  'Spices',
  'Whole spices',
  'Masala',
  'Organic seeds',
  'Herbs',
  'Vegetables',
];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Spices',
    price: '',
    discount: '0',
    stock: '',
    image: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        const p = res.data.product;
        setFormData({
          name: p.name,
          description: p.description,
          category: p.category,
          price: p.price.toString(),
          discount: (p.discount || 0).toString(),
          stock: p.stock.toString(),
          image: p.image,
        });
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.put(`/products/${id}`, {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount || 0),
        stock: parseInt(formData.stock, 10),
      });

      navigate('/vendor/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-xs text-stone-500 font-semibold">Loading product information...</div>
      </div>
    );
  }

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
              Edit Product Details
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Update pricing, inventory stocks, or product description.
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
                <label className="block text-xs font-bold text-stone-700 mb-1">Stock Quantity *</label>
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
                <label className="block text-xs font-bold text-stone-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="1"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Image URL *</label>
              <input
                type="url"
                required
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
              />
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
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Saving Changes...' : 'Save Modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
