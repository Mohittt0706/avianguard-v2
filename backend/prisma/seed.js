const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@avianguard.org' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@avianguard.org',
      password: await bcrypt.hash('Admin@123', 12),
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`  ✓ Super admin created: ${superAdmin.email}`);

  const operator = await prisma.user.upsert({
    where: { email: 'operator@avianguard.org' },
    update: {},
    create: {
      name: 'Default Operator',
      email: 'operator@avianguard.org',
      password: await bcrypt.hash('Operator@123', 12),
      role: 'OPERATOR',
      isActive: true,
    },
  });
  console.log(`  ✓ Operator created: ${operator.email}`);

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@avianguard.org' },
    update: {},
    create: {
      name: 'Default Viewer',
      email: 'viewer@avianguard.org',
      password: await bcrypt.hash('Viewer@123', 12),
      role: 'VIEWER',
      isActive: true,
    },
  });
  console.log(`  ✓ Viewer created: ${viewer.email}`);

  console.log('✅ Seeding complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
