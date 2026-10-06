import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Store, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VendorLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/vendor/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, 'VENDOR');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Vendor login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail('vendor@masalaghar.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Store className="w-3.5 h-3.5" /> Vendor Partner Portal
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-stone-900">
            Vendor Sign In
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Access your seller dashboard, manage spice inventory, and fulfill customer orders.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Autofill Button */}
          <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="text-[11px] text-amber-900">
              <span className="font-bold">Evaluation Demo:</span>
              <p className="text-amber-700">vendor@masalaghar.com</p>
            </div>
            <button
              type="button"
              onClick={fillTestCredentials}
              className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Auto-fill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Vendor Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  placeholder="vendor@masalaghar.com"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-900 hover:bg-stone-900 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Enter Vendor Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-stone-100 text-center space-y-3">
            <p className="text-xs text-stone-600">
              New spice seller or miller?{' '}
              <Link to="/vendor/register" className="font-bold text-amber-800 hover:underline">
                Register as Vendor
              </Link>
            </p>
            <p className="text-xs text-stone-400">
              Looking to buy spices?{' '}
              <Link to="/login" className="font-semibold text-stone-700 hover:text-amber-800">
                Customer Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
