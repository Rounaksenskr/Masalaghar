const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { seedUsers, seedProducts, seedReviews } = require('../data/seedData');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Expanded Catalog into Neon PostgreSQL Database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Seed or Update Users (Vendors & Customer)
  const userMap = {};

  for (const user of seedUsers) {
    let existing = await prisma.user.findUnique({
      where: { email: user.email.toLowerCase() },
    });

    if (!existing) {
      existing = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email.toLowerCase(),
          password: hashedPassword,
          role: user.role,
          phone: user.phone,
          address: user.address,
        },
      });

      if (existing.role === 'CUSTOMER') {
        await prisma.cart.create({
          data: { userId: existing.id },
        });
      }
      console.log(` Created User: ${existing.name} (${existing.role})`);
    } else {
      console.log(` User verified: ${existing.name}`);
    }

    userMap[user.email] = existing.id;
  }

  // 2. Seed Expanded Products
  for (const product of seedProducts) {
    let targetVendorId = userMap['vendor@masalaghar.com'] || 2;
    if (product.vendorId === 3 && userMap['vendor2@masalaghar.com']) {
      targetVendorId = userMap['vendor2@masalaghar.com'];
    } else if (product.vendorId === 4 && userMap['vendor3@masalaghar.com']) {
      targetVendorId = userMap['vendor3@masalaghar.com'];
    } else if (product.vendorId === 5 && userMap['vendor4@masalaghar.com']) {
      targetVendorId = userMap['vendor4@masalaghar.com'];
    }

    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          category: product.category,
          origin: product.origin || 'India',
          unit: product.unit || '250g',
          price: product.price,
          discount: product.discount || 0,
          stock: product.stock,
          image: product.image,
          vendorId: targetVendorId,
        },
      });
      console.log(` Inserted Spice: ${product.name} [${product.origin}]`);
    } else {
      // Update origin and unit if missing
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          origin: product.origin || existingProduct.origin,
          unit: product.unit || existingProduct.unit,
        },
      });
      console.log(` Updated Spice: ${product.name}`);
    }
  }

  // 3. Seed Reviews
  const customerId = userMap['customer@masalaghar.com'] || 1;
  for (const rev of seedReviews) {
    const prod = await prisma.product.findFirst({
      where: { name: rev.productName },
    });

    if (prod) {
      const existingRev = await prisma.review.findFirst({
        where: { productId: prod.id, userId: customerId },
      });

      if (!existingRev) {
        await prisma.review.create({
          data: {
            rating: rev.rating,
            comment: rev.comment,
            userId: customerId,
            productId: prod.id,
          },
        });
        console.log(` Added Customer Review for: ${prod.name}`);
      }
    }
  }

  const totalProducts = await prisma.product.count();
  const totalUsers = await prisma.user.count();
  const totalReviews = await prisma.review.count();

  console.log(`\n🎉 DATABASE EXPANSION COMPLETE!`);
  console.log(` Live Products: ${totalProducts}`);
  console.log(` Registered Users: ${totalUsers}`);
  console.log(` Customer Reviews: ${totalReviews}`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
