const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { seedUsers, seedProducts } = require('../data/seedData');

// Hash password helper for seeded accounts
const hashedPassword = bcrypt.hashSync('password123', 10);

// Initialize Prisma
const realPrisma = new PrismaClient();

// In-Memory Dev Store Fallback (Guarantees zero-downtime evaluation if Postgres is offline)
class DevDataStore {
  constructor() {
    this.users = seedUsers.map(u => ({ ...u, password: hashedPassword }));
    this.products = [...seedProducts];
    this.carts = [
      { id: 1, userId: 1, createdAt: new Date(), updatedAt: new Date() }
    ];
    this.cartItems = [
      { id: 1, cartId: 1, productId: 1, quantity: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, cartId: 1, productId: 4, quantity: 1, createdAt: new Date(), updatedAt: new Date() }
    ];
    this.orders = [
      {
        id: 1001,
        userId: 1,
        totalAmount: 774,
        status: 'CONFIRMED',
        deliveryAddress: 'Flat 402, Green Valley Apartments, Indiranagar, Bengaluru, Karnataka 560038',
        customerPhone: '+91 98765 43210',
        createdAt: new Date('2025-01-26T14:30:00Z'),
        updatedAt: new Date('2025-01-26T14:35:00Z')
      }
    ];
    this.orderItems = [
      {
        id: 1,
        orderId: 1001,
        productId: 1,
        quantity: 2,
        price: 144, // 160 - 10%
        vendorId: 2,
        createdAt: new Date('2025-01-26T14:30:00Z')
      },
      {
        id: 2,
        orderId: 1001,
        productId: 4,
        quantity: 1,
        price: 465.5, // 490 - 5%
        vendorId: 3,
        createdAt: new Date('2025-01-26T14:30:00Z')
      }
    ];
    this.payments = [
      {
        id: 1,
        orderId: 1001,
        razorpayOrderId: 'order_test_mock_1001',
        razorpayPaymentId: 'pay_test_mock_1001',
        razorpaySignature: 'sig_mock_verified',
        amount: 774,
        status: 'SUCCESS',
        method: 'RAZORPAY',
        createdAt: new Date('2025-01-26T14:32:00Z'),
        updatedAt: new Date('2025-01-26T14:35:00Z')
      }
    ];

    this.user = {
      findUnique: async ({ where }) => {
        if (where.id) return this.users.find(u => u.id === Number(where.id)) || null;
        if (where.email) return this.users.find(u => u.email.toLowerCase() === where.email.toLowerCase()) || null;
        return null;
      },
      create: async ({ data }) => {
        const id = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
        const newUser = {
          id,
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
          role: data.role || 'CUSTOMER',
          phone: data.phone || null,
          address: data.address || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.users.push(newUser);
        return newUser;
      },
      findMany: async () => [...this.users],
    };

    this.product = {
      findMany: async (args = {}) => {
        let results = [...this.products];
        const where = args.where || {};

        if (where.category) {
          results = results.filter(p => p.category.toLowerCase() === where.category.toLowerCase());
        }
        if (where.vendorId) {
          results = results.filter(p => p.vendorId === Number(where.vendorId));
        }
        if (where.name && where.name.contains) {
          const query = where.name.contains.toLowerCase();
          results = results.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
        }

        // Attach vendor details
        results = results.map(p => ({
          ...p,
          vendor: this.users.find(u => u.id === p.vendorId) || null,
        }));

        if (args.orderBy && args.orderBy.createdAt === 'desc') {
          results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return results;
      },
      findUnique: async ({ where }) => {
        const prod = this.products.find(p => p.id === Number(where.id));
        if (!prod) return null;
        return {
          ...prod,
          vendor: this.users.find(u => u.id === prod.vendorId) || null,
        };
      },
      create: async ({ data }) => {
        const id = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
        const newProduct = {
          id,
          name: data.name,
          description: data.description,
          category: data.category,
          price: Number(data.price),
          discount: data.discount !== undefined ? Number(data.discount) : 0,
          stock: Number(data.stock),
          image: data.image,
          vendorId: Number(data.vendorId),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.products.unshift(newProduct);
        return newProduct;
      },
      update: async ({ where, data }) => {
        const index = this.products.findIndex(p => p.id === Number(where.id));
        if (index === -1) throw new Error('Product not found');
        const updated = {
          ...this.products[index],
          ...data,
          price: data.price !== undefined ? Number(data.price) : this.products[index].price,
          discount: data.discount !== undefined ? Number(data.discount) : this.products[index].discount,
          stock: data.stock !== undefined ? Number(data.stock) : this.products[index].stock,
          updatedAt: new Date(),
        };
        this.products[index] = updated;
        return updated;
      },
      delete: async ({ where }) => {
        const index = this.products.findIndex(p => p.id === Number(where.id));
        if (index === -1) throw new Error('Product not found');
        const [deleted] = this.products.splice(index, 1);
        return deleted;
      },
      count: async ({ where } = {}) => {
        if (!where) return this.products.length;
        if (where.vendorId) return this.products.filter(p => p.vendorId === Number(where.vendorId)).length;
        return this.products.length;
      }
    };

    this.cart = {
      findUnique: async ({ where, include }) => {
        let cart = null;
        if (where.userId) cart = this.carts.find(c => c.userId === Number(where.userId));
        else if (where.id) cart = this.carts.find(c => c.id === Number(where.id));
        if (!cart) return null;
        
        let items = this.cartItems.filter(ci => ci.cartId === cart.id);
        if (include && include.items) {
          items = items.map(ci => ({
            ...ci,
            product: this.products.find(p => p.id === ci.productId) || null,
          }));
        }
        return { ...cart, items };
      },
      create: async ({ data }) => {
        const id = this.carts.length > 0 ? Math.max(...this.carts.map(c => c.id)) + 1 : 1;
        const newCart = { id, userId: Number(data.userId), createdAt: new Date(), updatedAt: new Date() };
        this.carts.push(newCart);
        return newCart;
      }
    };

    this.cartItem = {
      findUnique: async ({ where }) => {
        if (where.id) return this.cartItems.find(ci => ci.id === Number(where.id)) || null;
        if (where.cartId_productId) {
          return this.cartItems.find(ci => ci.cartId === Number(where.cartId_productId.cartId) && ci.productId === Number(where.cartId_productId.productId)) || null;
        }
        return null;
      },
      create: async ({ data }) => {
        const id = this.cartItems.length > 0 ? Math.max(...this.cartItems.map(ci => ci.id)) + 1 : 1;
        const newItem = {
          id,
          cartId: Number(data.cartId),
          productId: Number(data.productId),
          quantity: Number(data.quantity || 1),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.cartItems.push(newItem);
        return newItem;
      },
      update: async ({ where, data }) => {
        const item = this.cartItems.find(ci => ci.id === Number(where.id));
        if (!item) throw new Error('CartItem not found');
        if (data.quantity !== undefined) item.quantity = Number(data.quantity);
        item.updatedAt = new Date();
        return item;
      },
      delete: async ({ where }) => {
        const index = this.cartItems.findIndex(ci => ci.id === Number(where.id));
        if (index === -1) throw new Error('CartItem not found');
        const [deleted] = this.cartItems.splice(index, 1);
        return deleted;
      },
      deleteMany: async ({ where }) => {
        if (where.cartId) {
          this.cartItems = this.cartItems.filter(ci => ci.cartId !== Number(where.cartId));
        }
        return { count: 1 };
      }
    };

    this.order = {
      findMany: async ({ where = {}, include = {}, orderBy = {} } = {}) => {
        let results = [...this.orders];
        if (where.userId) {
          results = results.filter(o => o.userId === Number(where.userId));
        }

        // Filter for vendor's products if querying vendor orders
        if (where.items && where.items.some && where.items.some.vendorId) {
          const vId = Number(where.items.some.vendorId);
          results = results.filter(o => {
            return this.orderItems.some(oi => oi.orderId === o.id && oi.vendorId === vId);
          });
        }

        results = results.map(o => {
          const order = { ...o };
          if (include.items) {
            order.items = this.orderItems
              .filter(oi => oi.orderId === o.id)
              .map(oi => ({
                ...oi,
                product: this.products.find(p => p.id === oi.productId) || null,
              }));
          }
          if (include.payment) {
            order.payment = this.payments.find(p => p.orderId === o.id) || null;
          }
          if (include.user) {
            const u = this.users.find(usr => usr.id === o.userId);
            order.user = u ? { id: u.id, name: u.name, email: u.email, phone: u.phone } : null;
          }
          return order;
        });

        if (orderBy.createdAt === 'desc') {
          results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return results;
      },
      findUnique: async ({ where, include = {} }) => {
        const o = this.orders.find(ord => ord.id === Number(where.id));
        if (!o) return null;
        const order = { ...o };
        if (include.items) {
          order.items = this.orderItems
            .filter(oi => oi.orderId === o.id)
            .map(oi => ({
              ...oi,
              product: this.products.find(p => p.id === oi.productId) || null,
            }));
        }
        if (include.payment) {
          order.payment = this.payments.find(p => p.orderId === o.id) || null;
        }
        if (include.user) {
          const u = this.users.find(usr => usr.id === o.userId);
          order.user = u ? { id: u.id, name: u.name, email: u.email, phone: u.phone } : null;
        }
        return order;
      },
      create: async ({ data, include = {} }) => {
        const id = this.orders.length > 0 ? Math.max(...this.orders.map(o => o.id)) + 1 : 1001;
        const newOrder = {
          id,
          userId: Number(data.userId),
          totalAmount: Number(data.totalAmount),
          status: data.status || 'PENDING',
          deliveryAddress: data.deliveryAddress,
          customerPhone: data.customerPhone || null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.orders.unshift(newOrder);

        // Create order items if provided
        if (data.items && data.items.create) {
          data.items.create.forEach(itemData => {
            const oiId = this.orderItems.length > 0 ? Math.max(...this.orderItems.map(i => i.id)) + 1 : 1;
            this.orderItems.push({
              id: oiId,
              orderId: id,
              productId: Number(itemData.productId),
              quantity: Number(itemData.quantity),
              price: Number(itemData.price),
              vendorId: Number(itemData.vendorId),
              createdAt: new Date(),
            });
          });
        }

        // Create payment if provided
        if (data.payment && data.payment.create) {
          const pId = this.payments.length > 0 ? Math.max(...this.payments.map(p => p.id)) + 1 : 1;
          this.payments.push({
            id: pId,
            orderId: id,
            razorpayOrderId: data.payment.create.razorpayOrderId || null,
            razorpayPaymentId: data.payment.create.razorpayPaymentId || null,
            razorpaySignature: data.payment.create.razorpaySignature || null,
            amount: Number(data.payment.create.amount),
            status: data.payment.create.status || 'PENDING',
            method: data.payment.create.method || 'RAZORPAY',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return this.order.findUnique({ where: { id }, include });
      },
      update: async ({ where, data, include = {} }) => {
        const order = this.orders.find(o => o.id === Number(where.id));
        if (!order) throw new Error('Order not found');
        if (data.status) order.status = data.status;
        order.updatedAt = new Date();
        return this.order.findUnique({ where: { id: order.id }, include });
      }
    };

    this.payment = {
      findUnique: async ({ where }) => {
        if (where.orderId) return this.payments.find(p => p.orderId === Number(where.orderId)) || null;
        if (where.id) return this.payments.find(p => p.id === Number(where.id)) || null;
        return null;
      },
      update: async ({ where, data }) => {
        let payment;
        if (where.orderId) payment = this.payments.find(p => p.orderId === Number(where.orderId));
        else if (where.id) payment = this.payments.find(p => p.id === Number(where.id));
        if (!payment) throw new Error('Payment not found');
        Object.assign(payment, data);
        payment.updatedAt = new Date();
        return payment;
      }
    };
  }
}

// Fallback singleton
const devStore = new DevDataStore();

let activeDb = devStore;
let isRealPostgres = false;

// Attempt PostgreSQL test connection
realPrisma.$connect()
  .then(() => {
    activeDb = realPrisma;
    isRealPostgres = true;
    console.log('🐘 PostgreSQL database connected successfully via Prisma ORM.');
  })
  .catch(() => {
    activeDb = devStore;
    isRealPostgres = false;
    console.log('📦 Local development data store loaded with authentic Indian spice catalog.');
    console.log('💡 Note: To connect PostgreSQL, set DATABASE_URL in server/.env and run prisma migrate.');
  });

module.exports = new Proxy({}, {
  get: (target, prop) => {
    if (prop === '$isPostgres') return isRealPostgres;
    if (prop === '$rawPrisma') return realPrisma;
    return activeDb[prop];
  }
});
