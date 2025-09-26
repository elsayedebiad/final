// scripts/createAdmin.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';     // ← عدل الإيميل لو حابب
  const plainPassword = 'StrongP@ssw0rd'; // ← عدل الباسورد برضو

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('❗️ Admin user already exists:', email);
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const newAdmin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin created:', newAdmin.email);
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
