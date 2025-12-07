/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AllExceptionsFilter } from "src/common/filters/all-exceptions-filter.filter";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import { UserModule } from "src/user/user.module";
import * as request from "supertest";
import { cleanDatabase } from "./utils/clean-database";
import { createTestUserV1 } from "./utils/create-test-user-v1";

describe("UserController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        UserModule,
        ConfigModule.forRoot({ isGlobal: true }),
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

  describe("/user (POST) V1", () => {
    it("Should create a user using V1", async () => {
      const newUser = {
        name: "John Doe",
        email: "john@email.com",
        password: "password123",
      };

      const response = await request(app.getHttpServer())
        .post("/v1/user")
        .send(newUser);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: "John Doe",
        email: "john@email.com",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userCredentials: {
          id: expect.any(String),
          lastLoginAt: null,
        },
      });
    });

    it("Should return 'BadRequestException' for all validations errors", async () => {
      const invalidUser = {
        name: "Jo",
        email: "johnemail.com",
        password: "pass",
      };

      const response = await request(app.getHttpServer())
        .post("/v1/user")
        .send(invalidUser);

      expect(response.body).toEqual({
        message: [
          "Nome precisa ter o mínimo de 3 caracteres.",
          "E-mail inválido.",
          "Senha precisa ter o mínimo de 6 caracteres.",
        ],
        error: "Bad Request",
        statusCode: 400,
      });
    });

    it("Should return 'BadRequestException' when user already exists", async () => {
      const newUser = {
        name: "Mary Doe",
        email: "john@email.com",
        password: "pass123",
      };

      await createTestUserV1(app);

      const response = await request(app.getHttpServer())
        .post("/v1/user")
        .send(newUser);

      expect(response.body).toEqual({
        message: ["Falha ao criar o usuário. Verifique os dados fornecidos."],
        error: "Bad Request",
        statusCode: 400,
      });
    });
  });

  describe("/user (POST) V2", () => {
    it("Should create a user using V2", async () => {
      const newUser = {
        userName: "John Doe",
        userEmail: "john@email.com",
        userPassword: "password123",
      };

      const response = await request(app.getHttpServer())
        .post("/v2/user")
        .send(newUser);

      expect(response.body).toEqual({
        id: expect.any(String),
        userName: "John Doe",
        userEmail: "john@email.com",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userCredentials: {
          id: expect.any(String),
          lastLoginAt: null,
        },
      });
    });

    it("Should return 'BadRequestException' for all validations errors", async () => {
      const invalidUser = {
        userName: "Jo",
        userEmail: "johnemail.com",
        userPassword: "pass",
      };

      const response = await request(app.getHttpServer())
        .post("/v2/user")
        .send(invalidUser);

      expect(response.body).toEqual({
        message: [
          "Nome precisa ter o mínimo de 3 caracteres.",
          "E-mail inválido.",
          "Senha precisa ter o mínimo de 6 caracteres.",
        ],
        error: "Bad Request",
        statusCode: 400,
      });
    });

    it("Should return 'BadRequestException' when user already exists", async () => {
      const existingUser = {
        userName: "John Doe",
        userEmail: "john@email.com",
        userPassword: "password123",
      };

      const newUser = {
        userName: "Mary Doe",
        userEmail: "john@email.com",
        userPassword: "pass123",
      };

      await request(app.getHttpServer()).post("/v2/user").send(existingUser);

      const response = await request(app.getHttpServer())
        .post("/v2/user")
        .send(newUser);

      expect(response.body).toEqual({
        message: ["Falha ao criar o usuário. Verifique os dados fornecidos."],
        error: "Bad Request",
        statusCode: 400,
      });
    });
  });

  describe("/user (GET) V1", () => {
    it("Should return an array of users", async () => {
      await createTestUserV1(app);

      const response = await request(app.getHttpServer()).get("/v1/user");

      expect(response.body).toEqual([
        {
          id: expect.any(String),
          name: "John Doe",
          email: "john@email.com",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          userCredentials: {
            id: expect.any(String),
            lastLoginAt: null,
          },
        },
      ]);
    });
  });
});
