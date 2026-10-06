import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
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
        role: 'CUSTOMER',
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl">🌿</span>
            <span className="font-serif-display font-extrabold text-2xl text-amber-950">
              MASALA GHAR
            </span>
          </Link>
          <h2 className="font-serif-display text-2xl font-bold text-stone-900">
            Create Customer Account
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Join Masala Ghar to buy freshly harvested and milled Indian spices.
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
              <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  placeholder="e.g. Aarti Deshmukh"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  placeholder="name@example.com"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Password *</label>
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
                <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                    placeholder="+91 Mobile"
                  />
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">City / Region</label>
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                    placeholder="e.g. Pune, MH"
                  />
                  <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Creating Account...' : 'Register Customer Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center space-y-2">
            <p className="text-xs text-stone-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-amber-800 hover:underline">
                Sign In
              </Link>
            </p>
            <p className="text-xs text-stone-400">
              Looking to sell on Masala Ghar?{' '}
              <Link to="/vendor/register" className="font-semibold text-stone-700 hover:text-amber-800">
                Register as Vendor →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
