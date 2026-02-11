const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function populateUserIds() {
  console.log('Populating userId for existing users...');
  
  const users = await prisma.user.findMany({
    where: {
      userId: null,
    },
  });

  console.log(`Found ${users.length} users without userId`);

  for (const user of users) {
    // Generate 6-digit userId
    let userId;
    let isUnique = false;
    
    // Keep generating until we get a unique one
    while (!isUnique) {
      userId = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Check if this userId already exists
      const existing = await prisma.user.findUnique({
        where: { userId },
      });
      
      if (!existing) {
        isUnique = true;
      }
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { userId },
    });
    
    console.log(`✓ Updated user ${user.email} with userId: ${userId}`);
  }

  console.log('Done!');
  await prisma.$disconnect();
}

populateUserIds().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
