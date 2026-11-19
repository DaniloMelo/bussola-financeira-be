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

  await prisma.user.create({
    data: {
      name: "admin",
      email: "admin@email.com",
      isActive: true,
      userCredentials: {
        create: {
          passwordHash:
            "$2a$12$/HFMFA9GVi/RRK4QW3r0ieTYWkyprQTFbXYBACoMzkPTexQk9rePu", // password123
          activationCode: "123456",
        },
      },
      roles: {
        connect: {
          name: "ADMIN",
        },
      },
    },
  });

  await prisma.applicationSetting.create({
    data: {
      key: "last_upstash_email_sent",
      value: "2026-11-18T22:35:46.441Z",
      category: "APPLICATION",
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
