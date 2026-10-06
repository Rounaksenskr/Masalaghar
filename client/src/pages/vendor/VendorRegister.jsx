import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Store, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VendorRegister = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        ...formData,
        role: 'VENDOR',
      });
      navigate('/vendor/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Vendor registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Store className="w-3.5 h-3.5" /> Seller Onboarding
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-stone-900">
            Register as a Spice Vendor
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            List your regional spices, seeds, and masala blends on Masala Ghar.
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Estate / Mill / Store Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  placeholder="e.g. Wayanad Organic Estate"
                />
                <Store className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Official Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  placeholder="contact@seller.com"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Account Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  placeholder="Minimum 6 characters"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Business Phone</label>
                <div className="relative">
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                    placeholder="+91 Contact"
                  />
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Origin City/State</label>
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                    placeholder="e.g. Idukki, Kerala"
                  />
                  <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-900 hover:bg-stone-900 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Creating Vendor Account...' : 'Complete Vendor Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-600">
              Already registered as a vendor?{' '}
              <Link to="/vendor/login" className="font-bold text-amber-800 hover:underline">
                Sign In to Dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
