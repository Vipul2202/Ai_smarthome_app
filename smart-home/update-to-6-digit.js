const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateTo6Digit() {
  console.log('Updating all users to 6-digit userId...');
  
  const users = await prisma.user.findMany();

  console.log(`Found ${users.length} users`);

  for (const user of users) {
    // Generate 6-digit userId
    let userId;
    let isUnique = false;
    
    // Keep generating until we get a unique one
    while (!isUnique) {
      userId = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Check if this userId already exists
      const existing = await prisma.user.findFirst({
        where: { 
          userId,
          id: { not: user.id }
        },
      });
      
      if (!existing) {
        isUnique = true;
      }
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { userId },
    });
    
    console.log(`✓ Updated user ${user.email} with new 6-digit userId: ${userId}`);
  }

  console.log('Done! All users now have 6-digit User IDs');
  await prisma.$disconnect();
}

updateTo6Digit().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
