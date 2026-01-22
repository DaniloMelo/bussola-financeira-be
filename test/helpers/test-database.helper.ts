import { PrismaService } from "src/prisma/prisma.service";

export class TestDatabaseHelper {
  constructor(private readonly prisma: PrismaService) {}

  async clearDatabase() {
    const tables = ["user_credentials", "users"];

    for (const table of tables) {
      await this.prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
      );
    }
  }

  async seedRoles() {
    await this.prisma.role.upsert({
      where: { name: "USER" },
      update: {},
      create: { name: "USER", description: "Default user" },
    });

    await this.prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", description: "System administrator" },
    });
  }

  async createRegularUser() {
    const credentials = {
      email: "johnDoe@email.com",
      password: "password123",
    };

    await this.prisma.user.create({
      data: {
        name: "John Doe",
        email: credentials.email,
        userCredentials: {
          create: {
            passwordHash:
              "$2a$12$kr0xznhAV/Ig74LXn0fZYeccB7cnv4KUSfrrkJAkSSigBZRl2oOdK", // password123 | 12 rounds
          },
        },
        roles: {
          connect: {
            name: "USER",
          },
        },
      },
    });

    return credentials;
  }

  async createAdminUser() {
    const credentials = {
      email: "test_admin_user@email.com",
      password: "password123",
    };

    await this.prisma.user.create({
      data: {
        name: "Test Admin User",
        email: credentials.email,
        userCredentials: {
          create: {
            passwordHash:
              "$2a$12$bywwlp9.ABqmZ/Iuo9dVZu/rTO4Hk5Wc.jhrUQHfoDq5EF0yiV37m", // password123 | 12 rounds
          },
        },
        roles: {
          connect: {
            name: "ADMIN",
          },
        },
      },
    });

    return credentials;
  }

  async setupTestDatabase() {
    await this.clearDatabase();
    await this.seedRoles();
    const adminUserCredentials = await this.createAdminUser();
    const regularUserCredentials = await this.createRegularUser();

    return {
      regularUserCredentials,
      adminUserCredentials,
    };
  }
}
