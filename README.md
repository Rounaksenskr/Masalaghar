# Masala Ghar (मसाला घर) 🌿

> **Pure Spices, Handcrafted Blends & Organic Harvest Marketplace**  
> A full-stack Indian organic spice e-commerce marketplace built with **React**, **Express.js**, **PostgreSQL**, and **Prisma ORM**.

---

## 📌 Project Overview

**Masala Ghar** connects spice farmers and traditional millers directly with culinary enthusiasts. The platform supports two distinct user roles:
1. **Customer**: Browse spice categories, search by aroma/name, manage a shopping cart, checkout with delivery addresses, pay with Razorpay, and track order fulfillment.
2. **Vendor**: Dedicated vendor portal, real-time inventory metrics, product CRUD operations, and order status updates (`PENDING` → `CONFIRMED` → `SHIPPED` → `DELIVERED` → `CANCELLED`).

---

## 🔑 Demo Credentials (1-Click Auto-Fill Available)

For quick testing and interviewer evaluation, both portals include an **Auto-fill** button:

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@masalaghar.com` | `password123` | [Customer Login](http://localhost:5173/login) |
| **Vendor** | `vendor@masalaghar.com` | `password123` | [Vendor Login](http://localhost:5173/vendor/login) |

---

## 🚀 Quick Start Instructions

### 1. Run Development Servers
From the root directory:
```bash
npm run dev
```
*(Runs backend on `http://localhost:5000` and frontend on `http://localhost:5173` concurrently)*

Alternatively, run in separate terminals:
```bash
# Terminal 1 - Backend:
npm run dev:server

# Terminal 2 - Frontend:
npm run dev:client
```

---

## 🗺️ Application Routes

### Customer Portal
- `/` — Homepage with categories, guarantees, and featured spices
- `/products` — Full marketplace catalog with category filter pills and live search
- `/products/:id` — Product details with quantity selector, stock badges, and vendor credit
- `/cart` — Shopping basket with real-time subtotal, savings, and delivery fee calculation
- `/checkout` — Shipping address form and Razorpay payment integration
- `/orders` — Customer orders history and tracking status
- `/login` & `/register` — Customer authentication with JWT & bcrypt

### Vendor Portal
- `/vendor/login` & `/vendor/register` — Separate vendor onboarding & sign-in
- `/vendor/dashboard` — Business metrics (Total Revenue, Live Products, Orders, Low Stock Alerts)
- `/vendor/products` — Catalog table with Edit and Delete options
- `/vendor/products/add` — Product listing form with sample image presets
- `/vendor/products/edit/:id` — Product inventory and pricing updater
- `/vendor/orders` — Customer orders containing the vendor's products with a live status updater

---

## 🧠 Interview Guide: How to Explain This Project

When presenting **Masala Ghar** to an interviewer, highlight these software engineering decisions:

### 1. Role-Based Access Control (RBAC)
- **Design**: Strict separation between `CUSTOMER` and `VENDOR` roles.
- **Implementation**: The backend uses JWT authentication (`protect` middleware) combined with role validation (`authorize('CUSTOMER')` or `authorize('VENDOR')`). A customer cannot access `/vendor/*` routes, and vendors cannot order products from their own accounts.

### 2. Multi-Vendor Isolation & Security
- **Security Check**: When a vendor edits (`PUT /api/products/:id`) or deletes a product, the backend explicitly verifies `product.vendorId === req.user.id`. A vendor cannot modify or delete competitors' listings.
- **Order Splitting**: In `OrderItem`, each snapshot stores `vendorId`. When a vendor accesses `/api/orders/vendor/orders`, they only view line items originating from their mill.

### 3. Database Layer & Portability
- **Prisma Schema**: Designed with 7 relational models: `User`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`, and `Payment`.
- **Zero-Friction Fallback**: Built with a smart repository proxy. If PostgreSQL is active, Prisma connects to PostgreSQL. If an interviewer evaluates the app without a running Postgres database, a local development store loads pre-seeded spice catalogs seamlessly without crashing.

### 4. Razorpay Payment Architecture
- **Order Creation**: Server initializes payment orders via `POST /api/payment/create-order` calculating exact payable amounts in paise.
- **Cryptographic Verification**: Verifies Razorpay signatures using Node.js `crypto` with `HMAC-SHA256(order_id + '|' + payment_id, secret)`.
- **Sandbox/Mock Mode**: Includes a development simulator for sandbox environments without requiring live merchant KYC credentials.
