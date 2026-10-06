import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/vendor/my-products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load vendor products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from your catalog?`)) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      setMsg({ type: 'success', text: `"${name}" removed successfully.` });
      setProducts(products.filter((p) => p.id !== id));
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete product.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to="/vendor/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-amber-800 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="font-serif-display text-3xl font-extrabold text-stone-900">
              My Listed Products
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Manage your active inventory, edit descriptions, or add new spice batches.
            </p>
          </div>

          <Link
            to="/vendor/products/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" /> Add New Product
          </Link>
        </div>

        {/* Feedback message */}
        {msg && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2 border ${
              msg.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            {msg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-xs text-stone-400">Loading catalog...</div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-6 font-bold">Product</th>
                    <th className="py-3.5 px-4 font-bold">Category</th>
                    <th className="py-3.5 px-4 font-bold">Price</th>
                    <th className="py-3.5 px-4 font-bold">Discount</th>
                    <th className="py-3.5 px-4 font-bold">Stock</th>
                    <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block text-sm line-clamp-1">{p.name}</span>
                            <span className="text-[11px] text-stone-400 line-clamp-1">{p.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-stone-900">
                        ₹{p.price}
                      </td>
                      <td className="py-4 px-4 font-semibold text-stone-600">
                        {p.discount ? `${p.discount}%` : '0%'}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-bold ${
                            p.stock > 10 ? 'text-emerald-700' : p.stock > 0 ? 'text-amber-700' : 'text-red-600'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/vendor/products/edit/${p.id}`}
                            className="p-2 text-stone-500 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition"
                            title="Edit product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <span className="text-4xl block mb-2">🌿</span>
              <h3 className="font-bold text-stone-800 text-sm mb-1">No products listed yet</h3>
              <p className="text-xs text-stone-500 mb-4">Start listing your spices to appear in the marketplace.</p>
              <Link
                to="/vendor/products/add"
                className="px-4 py-2 rounded-xl bg-amber-800 text-white font-bold text-xs"
              >
                Add Your First Product
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProducts;
