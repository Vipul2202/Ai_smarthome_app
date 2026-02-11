const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function addUserIdToExistingUsers() {
  try {
    console.log('🔍 Finding users without User IDs...');

    // Find all users without a userId
    const usersWithoutId = await prisma.user.findMany({
      where: {
        OR: [
          { userId: null },
          { userId: '' }
        ]
      }
    });

    console.log(`Found ${usersWithoutId.length} users without User IDs`);

    if (usersWithoutId.length === 0) {
      console.log('✅ All users already have User IDs!');
      return;
    }

    // Generate and assign User IDs
    for (const user of usersWithoutId) {
      // Generate unique 6-digit userId
      let userId;
      let isUnique = false;
      
      while (!isUnique) {
        userId = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Check if this userId already exists
        const existing = await prisma.user.findUnique({
          where: { userId }
        });
        
        if (!existing) {
          isUnique = true;
        }
      }

      // Update user with new userId
      await prisma.user.update({
        where: { id: user.id },
        data: { userId }
      });

      console.log(`✅ Assigned User ID ${userId} to ${user.email}`);
    }

    console.log('\n🎉 All users now have 6-digit User IDs!');
    
    // Show all users with their IDs
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        userId: true
      }
    });

    console.log('\n📋 Current Users:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.name}): ${user.userId}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUserIdToExistingUsers();
