import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
      description: "Default user",
    },
  });

  await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "System administrator",
    },
  });
}

void (async () => {
  try {
    await main();
    console.log("🟢 Database successfully seeded");
  } catch (e) {
    console.error("🔴 Error on seeding database: ", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
