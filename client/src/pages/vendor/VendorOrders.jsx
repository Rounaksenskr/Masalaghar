import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, RefreshCw, Phone, MapPin } from 'lucide-react';
import api from '../../services/api';

const statusBadgeStyles = {
  PENDING: 'bg-amber-100 text-amber-900 border-amber-300',
  CONFIRMED: 'bg-blue-100 text-blue-900 border-blue-300',
  SHIPPED: 'bg-purple-100 text-purple-900 border-purple-300',
  DELIVERED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  CANCELLED: 'bg-red-100 text-red-900 border-red-300',
};

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/vendor/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load vendor orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      setFeedback({ type: 'success', text: `Order #${orderId} status changed to ${newStatus}.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to update order status.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to="/vendor/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-amber-800 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="font-serif-display text-3xl font-extrabold text-stone-900">
              Vendor Order Fulfillment
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Customer orders that contain products from your spice mill or estate.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2 border ${
              feedback.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            {feedback.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm"
              >
                {/* Order Top Bar */}
                <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-stone-400 block font-bold uppercase text-[10px]">Order ID</span>
                      <span className="font-extrabold text-stone-900 text-sm">#{order.id}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-bold uppercase text-[10px]">Order Date</span>
                      <span className="font-medium text-stone-700">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-bold uppercase text-[10px]">Your Subtotal</span>
                      <span className="font-extrabold text-amber-950 text-sm">₹{order.vendorTotal}</span>
                    </div>
                  </div>

                  {/* Status Dropdown Controller */}
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-600 text-xs">Fulfillment Status:</span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border focus:outline-none focus:ring-2 focus:ring-amber-700 cursor-pointer ${
                        statusBadgeStyles[order.status]
                      }`}
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Body: Items & Shipping Details */}
                <div className="p-6 grid md:grid-cols-12 gap-6">
                  {/* Your items in this order */}
                  <div className="md:col-span-7 space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                      Your Products in this Order
                    </h4>
                    {(order.vendorItems || []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-3 rounded-xl bg-stone-50 border border-stone-100"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product?.image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=100&q=80'}
                            alt={item.product?.name}
                            className="w-10 h-10 rounded-lg object-cover bg-stone-200"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block">{item.product?.name}</span>
                            <span className="text-stone-500 text-[11px]">Qty: {item.quantity} × ₹{item.price}</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-stone-900">
                          ₹{Math.round(item.quantity * item.price * 100) / 100}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Customer Delivery info */}
                  <div className="md:col-span-5 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/60 text-xs space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                      Customer Delivery Details
                    </h4>
                    <p className="font-bold text-stone-800 text-sm">{order.user?.name || 'Customer'}</p>
                    <p className="text-stone-600 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress}</span>
                    </p>
                    <p className="text-stone-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                      <span>{order.customerPhone || order.user?.phone || 'No phone provided'}</span>
                    </p>
                    <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 flex justify-between">
                      <span>Payment Status:</span>
                      <span className="font-bold text-emerald-700">
                        {order.payment?.status || 'PAID'} (Razorpay)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto shadow-sm">
            <span className="text-4xl block mb-2">📦</span>
            <h3 className="font-serif-display text-xl font-bold text-stone-900 mb-2">
              No Orders Received Yet
            </h3>
            <p className="text-xs text-stone-500">
              When customers order spices from your catalog, they will appear here for fulfillment and status updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
