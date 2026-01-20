/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AdminModule } from "src/admin/admin.module";
import { AllExceptionsFilter } from "src/common/filters/all-exceptions-filter.filter";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import { cleanDatabase } from "./utils/clean-database";
import { loginTestUserV1 } from "./utils/login-test-user-v1";
import * as request from "supertest";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";

describe("Admin (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AdminModule,
        UserModule,
        AuthModule,
        PrismaModule,
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
        }),
      ],
    }).compile();

    app = module.createNestApplication();

    prisma = module.get<PrismaService>(PrismaService);

    app.enableShutdownHooks();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());

    app.enableVersioning({
      type: VersioningType.URI,
    });

    await app.init();
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  describe("admin-user", () => {
    describe("/v1/admin (GET)", () => {
      it("Should return all stored users", async () => {
        await prisma.user.create({
          data: {
            name: "admin",
            email: "admin@email.com",
            userCredentials: {
              create: {
                passwordHash:
                  "$2a$12$/HFMFA9GVi/RRK4QW3r0ieTYWkyprQTFbXYBACoMzkPTexQk9rePu",
              },
            },
            roles: {
              connect: {
                name: "ADMIN",
              },
            },
          },
        });

        const { access_token } = await loginTestUserV1(app, {
          email: "admin@email.com",
          password: "password123",
        });

        const response = await request(app.getHttpServer())
          .get("/v1/admin?limit=10&offset=0")
          .set("Authorization", `Bearer ${access_token}`);

        expect(response.body).toEqual([
          {
            id: expect.any(String),
            name: "admin",
            email: "admin@email.com",
            deletedAt: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            userCredentials: { lastLoginAt: expect.any(String) },
            roles: [{ name: "ADMIN" }],
          },
        ]);
      });
    });
  });
});
