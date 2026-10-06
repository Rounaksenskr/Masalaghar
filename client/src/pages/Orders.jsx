import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, CheckCircle2, Clock, Truck, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';

const statusBadgeStyles = {
  PENDING: 'bg-amber-100 text-amber-900 border-amber-300',
  CONFIRMED: 'bg-blue-100 text-blue-900 border-blue-300',
  SHIPPED: 'bg-purple-100 text-purple-900 border-purple-300',
  DELIVERED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  CANCELLED: 'bg-red-100 text-red-900 border-red-300',
};

const Orders = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const justPlacedOrder = location.state?.orderSuccess;
  const justPlacedOrderId = location.state?.orderId;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Banner if redirected from checkout */}
        {justPlacedOrder && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-serif-display text-lg font-bold text-emerald-950">
                  Order Confirmed! (Order #{justPlacedOrderId})
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Your spice order has been verified with Razorpay and dispatched to our vendor millers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif-display text-3xl font-extrabold text-stone-900">
              My Spice Orders
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Track status, delivery details, and order history.
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
          >
            Shop More Spices <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm"
              >
                {/* Order Header */}
                <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-stone-400 block font-semibold uppercase text-[10px]">Order ID</span>
                      <span className="font-bold text-stone-900">#{order.id}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold uppercase text-[10px]">Order Date</span>
                      <span className="font-medium text-stone-700">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold uppercase text-[10px]">Total Amount</span>
                      <span className="font-extrabold text-amber-950">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        statusBadgeStyles[order.status] || 'bg-stone-100 text-stone-800'
                      }`}
                    >
                      Status: {order.status}
                    </span>

                    {order.payment && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Paid ({order.payment.method})
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {(order.items || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs gap-4 pb-3 border-b border-stone-100 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product?.image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=100&q=80'}
                            alt={item.product?.name || 'Spice item'}
                            className="w-12 h-12 rounded-xl object-cover bg-stone-100"
                          />
                          <div>
                            <Link
                              to={`/products/${item.productId}`}
                              className="font-bold text-stone-900 hover:text-amber-800 transition text-sm"
                            >
                              {item.product?.name || `Spice Product #${item.productId}`}
                            </Link>
                            <p className="text-stone-500 mt-0.5">
                              Quantity: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                        <span className="font-extrabold text-stone-900 text-sm">
                          ₹{Math.round(item.quantity * item.price * 100) / 100}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 gap-2">
                    <div>
                      <span className="font-bold text-stone-700">Delivery Address: </span>
                      <span>{order.deliveryAddress}</span>
                    </div>
                    {order.customerPhone && (
                      <div>
                        <span className="font-bold text-stone-700">Phone: </span>
                        <span>{order.customerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h3 className="font-serif-display text-xl font-bold text-stone-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              You haven't placed any orders with Masala Ghar yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800 text-white font-bold text-xs"
            >
              Browse All Spices
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
