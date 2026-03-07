import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const seedStart = Date.now();

  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // ---------- USERS ----------
  const users: any[] = [];
  const start = Date.now();
  while (users.length < 25) {
    users.push({
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      password: await bcrypt.hash('password123', 10),
      birthdate: faker.date.birthdate(),
    });
  }

  const createdUsers = await prisma.user.createMany({
    data: users,
  });
  const end = Date.now();
  console.log(`Users seeding took ${(end - start) / 1000} seconds`);
  console.log('Users created:', createdUsers.count);

  // ---------- PRODUCTS ----------
  const products: any[] = [];

  const productStart = Date.now();
  while (products.length < 30) {
    products.push({
      name: faker.commerce.productName(),
      version: `${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}`,
      shortDescription: faker.commerce.productDescription(),
      longDescription:
        faker.commerce.productDescription() + ' ' + faker.commerce.productDescription(),
      inStock: faker.datatype.boolean(),
      images: Array.from({ length: Math.floor(Math.random() * 7) + 1 }, () => ({
        url: faker.image.urlPicsumPhotos(),
        alt: faker.commerce.productName(),
      })),
      price: {
        reseller: faker.number.int({ min: 50, max: 400 }),
        RRP: faker.number.int({ min: 100, max: 500 }),
        discount: faker.number.float({ min: 10, max: 50 }),
      },
    });
  }

  const createdProducts = await prisma.product.createMany({
    data: products,
  });

  const productEnd = Date.now();
  console.log(`Products seeding took ${(productEnd - productStart) / 1000} seconds`);
  console.log('Products created:', createdProducts.count);

  // ---------- REVIEWS ----------
  const reviewStart = Date.now();
  const pairs: any[] = [];

  const [dbUsers, dbProducts] = await Promise.all([
    prisma.user.findMany({
      select: { id: true },
    }),
    prisma.product.findMany({
      select: { id: true },
    }),
  ]);

  for (const user of dbUsers) {
    for (const product of dbProducts) {
      pairs.push({
        userId: user.id,
        productId: product.id,
      });
    }
  }

  // shuffle pairs
  pairs.sort(() => Math.random() - 0.5);

  const selectedPairs = pairs.slice(0, 250);

  const reviewsData = selectedPairs.map((pair) => ({
    ...pair,
    content: faker.lorem.sentences(5),
    rating: faker.helpers.weightedArrayElement([
      { weight: 40, value: 5 },
      { weight: 30, value: 4 },
      { weight: 15, value: 3 },
      { weight: 10, value: 2 },
      { weight: 5, value: 1 },
    ]),
  }));

  const reviewCount = await prisma.review.createMany({ data: reviewsData });

  const reviewEnd = Date.now();
  console.log(`Reviews seeding took ${(reviewEnd - reviewStart) / 1000} seconds`);
  console.log('Reviews created:', reviewCount.count);

  const seedEnd = Date.now();
  console.log(`Seeding complete! took ${(seedEnd - seedStart) / 1000} seconds`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
