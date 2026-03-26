import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@divorcios.mx" },
    update: {},
    create: {
      email: "admin@divorcios.mx",
      passwordHash,
      name: "Administrador",
      role: "ADMIN",
    },
  });

  console.log(`Admin user created: ${admin.email}`);

  // Create default LawyerConfig
  const config = await prisma.lawyerConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
    },
  });

  console.log(`LawyerConfig created: ${config.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
