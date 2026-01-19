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
        const { access_token } = await loginTestUserV1(app, {
          email: "admin@email.com",
          password: "password123",
        });

        console.log("ACCESS ==> ", access_token);

        const users = await prisma.user.findMany();

        console.log("BD USERS ===> ", users);

        const roles = await prisma.role.findMany();

        console.log("ROLES ===> ", roles);

        const response = await request(app.getHttpServer())
          .get("/v1/admin?limit=10&offset=0")
          .set("Authorization", `Bearer ${access_token}`);

        console.log(response.body);
      });
    });
  });
});
