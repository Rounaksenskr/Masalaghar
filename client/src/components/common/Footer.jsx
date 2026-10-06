import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-stone-800 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Pure & Lab Tested</h4>
              <p className="text-xs text-stone-400">Zero artificial colors, fillers or lead chromate.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Direct From Farm Estates</h4>
              <p className="text-xs text-stone-400">Salem turmeric, Malabar cardamom & Nagaur methi.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-500">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Fast All-India Shipping</h4>
              <p className="text-xs text-stone-400">Aroma-lock sealed packaging to preserve natural oils.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌿</span>
              <span className="font-serif-display font-bold text-xl text-white tracking-wide">
                MASALA GHAR
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Reviving India's traditional spice heritage with ethically sourced, stone-ground, aromatic spices and heritage seeds.
            </p>
          </div>

          <div>
            <h5 className="text-xs uppercase font-bold tracking-wider text-amber-400 mb-4">Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=Spices" className="hover:text-amber-300 transition">Spices & Powders</Link></li>
              <li><Link to="/products?category=Whole spices" className="hover:text-amber-300 transition">Whole Spices (Khada)</Link></li>
              <li><Link to="/products?category=Masala" className="hover:text-amber-300 transition">Speciality Masala Blends</Link></li>
              <li><Link to="/products?category=Organic seeds" className="hover:text-amber-300 transition">Organic Native Seeds</Link></li>
              <li><Link to="/products?category=Herbs" className="hover:text-amber-300 transition">Culinary & Medicinal Herbs</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase font-bold tracking-wider text-amber-400 mb-4">Customer Portal</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products" className="hover:text-amber-300 transition">Browse Products</Link></li>
              <li><Link to="/cart" className="hover:text-amber-300 transition">Shopping Cart</Link></li>
              <li><Link to="/orders" className="hover:text-amber-300 transition">Track Orders</Link></li>
              <li><Link to="/login" className="hover:text-amber-300 transition">Customer Login</Link></li>
              <li><Link to="/register" className="hover:text-amber-300 transition">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase font-bold tracking-wider text-amber-400 mb-4">Vendor Partner Portal</h5>
            <p className="text-xs text-stone-400 mb-3">
              Are you a farmer, spice miller, or regional organic producer?
            </p>
            <div className="space-y-2">
              <Link
                to="/vendor/login"
                className="inline-block px-3.5 py-1.5 rounded-lg bg-amber-600/30 text-amber-300 border border-amber-600/50 hover:bg-amber-600/40 text-xs font-semibold transition"
              >
                Vendor Sign In
              </Link>
              <br />
              <Link
                to="/vendor/register"
                className="inline-block text-xs text-stone-400 hover:text-white underline mt-1"
              >
                Register as Vendor
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Masala Ghar. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-amber-500 inline fill-amber-500" /> for authentic Indian culinary traditions.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
