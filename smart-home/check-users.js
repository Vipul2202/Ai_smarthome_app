const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('📋 All users in database:\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        provider: true,
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   User ID: ${user.userId || 'NOT SET'}`);
      console.log(`   Provider: ${user.provider}`);
      console.log(`   DB ID: ${user.id}`);
      console.log('');
    });

    console.log(`Total users: ${users.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
