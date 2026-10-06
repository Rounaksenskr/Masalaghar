import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, LogOut, Package, Store, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, isVendor, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isVendorRoute = location.pathname.startsWith('/vendor');

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Announcement Bar */}
      <div className="bg-amber-900 text-amber-100 text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        🌿 100% Pure, Unadulterated & Stone-Ground Spices Delivered Across India
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-sm text-xl font-bold">
              🌿
            </div>
            <div>
              <span className="font-serif-display font-extrabold text-2xl tracking-tight text-amber-950 block leading-tight">
                MASALA GHAR
              </span>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold block">
                Pure Spices & Harvest
              </span>
            </div>
          </Link>

          {/* Search Bar (Customer View) */}
          {!isVendorRoute && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search haldi, cardamom, biryani masala, seeds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-stone-300 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </form>
          )}

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            {!isVendorRoute ? (
              <>
                <Link to="/" className="text-sm font-medium text-stone-700 hover:text-amber-800 transition">
                  Home
                </Link>
                <Link to="/products" className="text-sm font-medium text-stone-700 hover:text-amber-800 transition">
                  All Spices
                </Link>
                <Link to="/products?category=Masala" className="text-sm font-medium text-stone-700 hover:text-amber-800 transition">
                  Masala Blends
                </Link>
                <Link to="/products?category=Organic seeds" className="text-sm font-medium text-stone-700 hover:text-amber-800 transition">
                  Organic Seeds
                </Link>
              </>
            ) : (
              <>
                <Link to="/vendor/dashboard" className="text-sm font-medium text-amber-900 hover:text-amber-700 transition">
                  Dashboard
                </Link>
                <Link to="/vendor/products" className="text-sm font-medium text-stone-700 hover:text-amber-700 transition">
                  My Products
                </Link>
                <Link to="/vendor/orders" className="text-sm font-medium text-stone-700 hover:text-amber-700 transition">
                  Vendor Orders
                </Link>
              </>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            
            {/* Vendor Portal Switcher Button */}
            {!isVendor ? (
              <Link
                to="/vendor/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
              >
                <Store className="w-3.5 h-3.5" />
                Vendor Portal
              </Link>
            ) : (
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition"
              >
                View Marketplace
              </Link>
            )}

            {/* Shopping Cart (Customer only) */}
            {!isVendor && (
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-stone-700 hover:bg-stone-100 hover:text-amber-800 transition"
                title="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Account Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-sm font-medium text-stone-800 transition"
                >
                  <User className="w-4 h-4 text-amber-700" />
                  <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'CUSTOMER' ? (
                      <>
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-900"
                        >
                          <Package className="w-4 h-4 text-stone-500" />
                          My Orders
                        </Link>
                        <Link
                          to="/cart"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-900"
                        >
                          <ShoppingBag className="w-4 h-4 text-stone-500" />
                          Cart ({itemCount})
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/vendor/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-900"
                        >
                          <Store className="w-4 h-4 text-stone-500" />
                          Vendor Dashboard
                        </Link>
                        <Link
                          to="/vendor/products"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-900"
                        >
                          <Package className="w-4 h-4 text-stone-500" />
                          Manage Products
                        </Link>
                      </>
                    )}

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-semibold text-stone-700 hover:text-amber-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <input
              type="text"
              placeholder="Search spices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </form>

          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-700 font-medium"
          >
            All Products
          </Link>
          <Link
            to="/products?category=Spices"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-700 font-medium"
          >
            Spices
          </Link>
          <Link
            to="/products?category=Masala"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-700 font-medium"
          >
            Masala Blends
          </Link>
          <Link
            to="/products?category=Organic seeds"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-700 font-medium"
          >
            Organic Seeds
          </Link>
          <Link
            to="/vendor/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-amber-800 font-semibold"
          >
            Vendor Portal
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
