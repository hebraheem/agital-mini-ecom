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
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: await bcrypt.hash('password123', 10),
        birthdate: faker.date.birthdate(),
      },
    });

    users.push(user);
  }

  const end = Date.now();
  console.log(`Users seeding took ${(end - start) / 1000} seconds`);
  console.log('Users created:', users.length);

  // ---------- PRODUCTS ----------
  const products: any[] = [];

  const productStart = Date.now();
  for (let i = 0; i < 25; i++) {
    const product = await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        version: `${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}`,
        shortDescription: faker.commerce.productDescription(),
        longDescription: faker.lorem.paragraph(),
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
      },
    });

    products.push(product);
  }

  const productEnd = Date.now();
  console.log(`Products seeding took ${(productEnd - productStart) / 1000} seconds`);
  console.log('Products created:', products.length);

  // ---------- REVIEWS ----------
  const reviews: any[] = [];

  const reviewStart = Date.now();
  for (let i = 0; i < 250; i++) {
    const review = await prisma.review.create({
      data: {
        content: faker.lorem.sentences(2),
        rating: faker.number.int({ min: 1, max: 5 }),
        userId: faker.helpers.arrayElement(users).id,
        productId: faker.helpers.arrayElement(products).id,
      },
    });

    reviews.push(review);
  }

  const reviewEnd = Date.now();
  console.log(`Reviews seeding took ${(reviewEnd - reviewStart) / 1000} seconds`);
  console.log('Reviews created:', reviews.length);

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
