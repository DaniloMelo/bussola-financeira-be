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
      userCredentials: {
        create: {
          passwordHash:
            "$2a$12$/HFMFA9GVi/RRK4QW3r0ieTYWkyprQTFbXYBACoMzkPTexQk9rePu", // password123
        },
      },
      roles: {
        connect: {
          name: "ADMIN",
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      name: "Test User E2E FE",
      email: "testusere2efe@email.com",
      userCredentials: {
        create: {
          passwordHash:
            "$2a$12$d0fXQPKs.HhLiiZJ8oBzZu9mcn0u2JWW0ExipuN4jPv1aDG0DxkAq", // StrongPass@123
        },
      },
      roles: {
        connect: {
          name: "USER",
        },
      },
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
