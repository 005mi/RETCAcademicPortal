const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

async function createAdmin() {
  const dbPath = path.join(process.cwd(), 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter });
  
  const username = 'admin';
  const password = '22222222';

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      console.log(`User ${username} already exists. Updating to ADMIN role and new password.`);
      await prisma.user.update({
        where: { username },
        data: {
          password_hash,
          role: 'ADMIN'
        }
      });
    } else {
      await prisma.user.create({
        data: {
          username,
          password_hash,
          role: 'ADMIN'
        }
      });
      console.log(`Admin user ${username} created successfully.`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
