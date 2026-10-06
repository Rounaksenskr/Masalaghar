import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Customer Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';

// Vendor Pages
import VendorLogin from './pages/vendor/VendorLogin';
import VendorRegister from './pages/vendor/VendorRegister';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import AddProduct from './pages/vendor/AddProduct';
import EditProduct from './pages/vendor/EditProduct';
import VendorOrders from './pages/vendor/VendorOrders';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen bg-[#faf8f5]">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              {/* Customer Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Protected Routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute role="CUSTOMER">
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute role="CUSTOMER">
                    <Orders />
                  </ProtectedRoute>
                }
              />

              {/* Vendor Public Routes */}
              <Route path="/vendor/login" element={<VendorLogin />} />
              <Route path="/vendor/register" element={<VendorRegister />} />

              {/* Vendor Protected Routes */}
              <Route
                path="/vendor/dashboard"
                element={
                  <ProtectedRoute role="VENDOR">
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/products"
                element={
                  <ProtectedRoute role="VENDOR">
                    <VendorProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/products/add"
                element={
                  <ProtectedRoute role="VENDOR">
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/products/edit/:id"
                element={
                  <ProtectedRoute role="VENDOR">
                    <EditProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/orders"
                element={
                  <ProtectedRoute role="VENDOR">
                    <VendorOrders />
                  </ProtectedRoute>
                }
              />

              {/* Fallback 404 Route */}
              <Route
                path="*"
                element={
                  <div className="min-h-[60vh] flex items-center justify-center text-center p-8">
                    <div>
                      <span className="text-5xl block mb-3">🌿</span>
                      <h2 className="font-serif-display text-2xl font-bold text-stone-900 mb-2">
                        Page Not Found
                      </h2>
                      <p className="text-xs text-stone-500 mb-6">
                        The requested page could not be located in Masala Ghar.
                      </p>
                      <a
                        href="/"
                        className="px-5 py-2.5 rounded-xl bg-amber-800 text-white font-bold text-xs"
                      >
                        Return to Marketplace
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
