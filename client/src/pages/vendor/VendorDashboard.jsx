import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, ShoppingCart, IndianRupee, Store, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const statusBadgeStyles = {
  PENDING: 'bg-amber-100 text-amber-900 border-amber-300',
  CONFIRMED: 'bg-blue-100 text-blue-900 border-blue-300',
  SHIPPED: 'bg-purple-100 text-purple-900 border-purple-300',
  DELIVERED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  CANCELLED: 'bg-red-100 text-red-900 border-red-300',
};

const VendorDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [prodRes, orderRes] = await Promise.all([
          api.get('/products/vendor/my-products'),
          api.get('/orders/vendor/orders'),
        ]);

        setProducts(prodRes.data.products || []);
        setOrders(orderRes.data.orders || []);
      } catch (err) {
        console.error('Failed to load vendor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute metrics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.vendorTotal || 0), 0);
  const lowStockItems = products.filter((p) => p.stock < 10);

  return (
    <div className="min-h-screen bg-[#faf8f5] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Store className="w-3.5 h-3.5" /> Verified Vendor Portal
            </div>
            <h1 className="font-serif-display text-3xl font-extrabold text-stone-900">
              Welcome, {user?.name}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Manage your listed spices, review real-time stock levels, and update customer order fulfillment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/vendor/products/add"
              className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add New Product
            </Link>
            <Link
              to="/vendor/products"
              className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-50 transition"
            >
              Manage Catalog
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Products</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-stone-900">{totalProducts}</p>
            <p className="text-[11px] text-stone-500 mt-1">Live in marketplace catalog</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Revenue</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-stone-900">₹{totalRevenue}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">From completed & active orders</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Customer Orders</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-stone-900">{totalOrders}</p>
            <p className="text-[11px] text-stone-500 mt-1">Containing your products</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Low Stock Alert</span>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-stone-900">{lowStockItems.length}</p>
            <p className="text-[11px] text-red-600 font-semibold mt-1">
              {lowStockItems.length > 0 ? 'Items need replenishment' : 'All stocks healthy'}
            </p>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-serif-display text-xl font-bold text-stone-900">
                Recent Customer Orders
              </h2>
              <p className="text-xs text-stone-500">
                Incoming orders containing spices from your catalog.
              </p>
            </div>
            <Link
              to="/vendor/orders"
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-stone-400">Loading orders...</div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-bold">Order ID</th>
                    <th className="pb-3 font-bold">Customer</th>
                    <th className="pb-3 font-bold">Your Items</th>
                    <th className="pb-3 font-bold">Payout</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50 transition">
                      <td className="py-3 font-bold text-stone-900">#{order.id}</td>
                      <td className="py-3 text-stone-700">
                        <div className="font-semibold">{order.user?.name || 'Customer'}</div>
                        <div className="text-[11px] text-stone-400">{order.user?.phone || 'No phone'}</div>
                      </td>
                      <td className="py-3 text-stone-600">
                        {(order.vendorItems || []).map((it) => `${it.product?.name || 'Spice'} (x${it.quantity})`).join(', ')}
                      </td>
                      <td className="py-3 font-bold text-stone-900">₹{order.vendorTotal}</td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            statusBadgeStyles[order.status] || 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to="/vendor/orders"
                          className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 font-bold text-[11px] transition"
                        >
                          Update Status
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-stone-500">No customer orders placed for your products yet.</p>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-amber-950 text-sm">💡 Pro-Tip for Spice Millers</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Keep your inventory updated regularly. When stock falls below 5 units, customers receive a low-stock alert on the product page.
            </p>
          </div>
          <Link
            to="/vendor/products/add"
            className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs whitespace-nowrap"
          >
            List Another Spice
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
