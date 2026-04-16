const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

async function listUsers() {
  const dbPath = path.join(process.cwd(), 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        student_id: true,
        email: true
      }
    });

    console.log('--- List of Users ---');
    users.forEach(u => {
      console.log(`ID: ${u.id} | Username: [${u.username}] | Role: ${u.role} | StudentID: ${u.student_id}`);
    });
    console.log('---------------------');
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
