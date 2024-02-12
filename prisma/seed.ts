import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  const test_user_email = process.env.TEST_USER_EMAIL;
  const test_user_password = process.env.TEST_USER_PASSWORD;
  const hashedPassword = await bcrypt.hash(test_user_password, 10);

  try {
    await prisma.user.create({
      data: {
        email: test_user_email,
        password: hashedPassword
      }
    });
    console.log('Test user created');
  } catch (e) {
    console.log('Test user already created', e);
  }
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
