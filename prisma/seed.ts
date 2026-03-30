import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Stesso algoritmo di `UsersService` / login: bcryptjs, cost factor 10 */
async function main() {
  const passwordPlain = 'admin123';
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@example.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
