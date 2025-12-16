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
import { IUpdateUserData } from "src/user/interfaces/update";
import { UserApiResponseDtoV1 } from "src/user/v1/dto/swagger/user-api-response.dto";
import { DeletedUserApiResponseDtoV1 } from "src/user/v1/dto/swagger/deleted-user-api-response.dto";

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
    it("Should create and persist a user using V1", async () => {
      const newUser = {
        name: "John Doe",
        email: "john@email.com",
        password: "password123",
      };

      const response = await request(app.getHttpServer())
        .post("/v1/user")
        .send(newUser)
        .expect(201);

      const reponseBody: UserApiResponseDtoV1 = response.body;

      expect(reponseBody).toEqual({
        id: expect.any(String),
        name: "John Doe",
        email: "john@email.com",
        deletedAt: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userCredentials: {
          id: expect.any(String),
          lastLoginAt: null,
        },
      });

      const storedUser = await prisma.user.findUnique({
        where: { id: reponseBody.id },
        include: { userCredentials: true },
      });

      expect(storedUser).toBeDefined();

      expect(storedUser?.name).toBe(newUser.name);

      expect(storedUser?.email).toBe(newUser.email);

      expect(storedUser?.userCredentials?.passwordHash).toBeDefined();

      expect(storedUser?.userCredentials?.passwordHash).not.toBe(
        newUser.password,
      );
    });

    it("Should return 'BadRequestException' for all validations errors", async () => {
      const invalidUser = {
        name: "Jo",
        email: "johnemail.com",
        password: "pass",
      };

      const response = await request(app.getHttpServer())
        .post("/v1/user")
        .send(invalidUser)
        .expect(400);

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
        .send(newUser)
        .expect(400);

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
        .send(newUser)
        .expect(201);

      const responseBody: UserApiResponseDtoV1 = response.body;

      expect(responseBody).toEqual({
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

      const storedUser = await prisma.user.findUnique({
        where: { id: responseBody.id },
        include: { userCredentials: true },
      });

      expect(storedUser).toBeDefined();
      expect(storedUser?.name).toBe(newUser.userName);
      expect(storedUser?.email).toBe(newUser.userEmail);
      expect(storedUser?.userCredentials?.passwordHash).toBeDefined();
      expect(storedUser?.userCredentials?.passwordHash).not.toBe(
        newUser.userPassword,
      );
    });

    it("Should return 'BadRequestException' for all validations errors", async () => {
      const invalidUser = {
        userName: "Jo",
        userEmail: "johnemail.com",
        userPassword: "pass",
      };

      const response = await request(app.getHttpServer())
        .post("/v2/user")
        .send(invalidUser)
        .expect(400);

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
        .send(newUser)
        .expect(400);

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

      const response = await request(app.getHttpServer())
        .get("/v1/user")
        .expect(200);

      expect(response.body).toEqual([
        {
          id: expect.any(String),
          name: "John Doe",
          email: "john@email.com",
          deletedAt: null,
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

  describe("/user (PATCH) V1", () => {
    it("Should update 'name' only", async () => {
      const user = await createTestUserV1(app);

      const dataToUpdate: IUpdateUserData = {
        name: "John Doe UPDATED",
      };

      const preUpdateStoredUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          userCredentials: {
            select: {
              passwordHash: true,
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/v1/user/${user.id}`)
        .send(dataToUpdate)
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: "John Doe UPDATED",
        email: "john@email.com",
        deletedAt: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userCredentials: {
          id: expect.any(String),
          lastLoginAt: null,
        },
      });

      const postUpdateStoredUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          userCredentials: {
            select: {
              passwordHash: true,
            },
          },
        },
      });

      expect(postUpdateStoredUser?.name).toBe("John Doe UPDATED");

      expect(postUpdateStoredUser?.email).toBe(preUpdateStoredUser?.email);

      expect(postUpdateStoredUser?.userCredentials?.passwordHash).toBe(
        preUpdateStoredUser?.userCredentials?.passwordHash,
      );
    });

    it("Should return 'BadRequestException' for all validations errors", async () => {
      const user = await createTestUserV1(app);

      const invalidDataToUpdate: IUpdateUserData = {
        name: "Jo",
        email: "invalid_email",
        password: "pass",
      };

      const response = await request(app.getHttpServer())
        .patch(`/v1/user/${user.id}`)
        .send(invalidDataToUpdate)
        .expect(400);

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

    it("Should return 'BadRequestException' if trying to update email to one that is already taken", async () => {
      const user = await createTestUserV1(app, { email: "userA@email.com" });
      await createTestUserV1(app, { email: "userB@email.com" });

      const dataToUpdate: IUpdateUserData = {
        email: "userB@email.com",
      };

      const response = await request(app.getHttpServer())
        .patch(`/v1/user/${user.id}`)
        .send(dataToUpdate)
        .expect(400);

      expect(response.body).toEqual({
        message: [
          "Impossível atualizar o seu usuário. Verifique as suas credenciais e tente novamente.",
        ],
        error: "Bad Request",
        statusCode: 400,
      });
    });

    it("Should update and encrypt 'password' if provided", async () => {
      const user = await createTestUserV1(app);

      const dataToUpdate: IUpdateUserData = {
        password: "new_password_123",
      };

      const preUpdatePasswordHash = await prisma.userCredentials.findUnique({
        where: { userId: user.id },
      });

      await request(app.getHttpServer())
        .patch(`/v1/user/${user.id}`)
        .send(dataToUpdate)
        .expect(200);

      const postUpdatePasswordHash = await prisma.userCredentials.findUnique({
        where: { userId: user.id },
      });

      expect(postUpdatePasswordHash?.passwordHash).not.toBe(
        dataToUpdate.password,
      );

      expect(preUpdatePasswordHash?.passwordHash).not.toBe(
        postUpdatePasswordHash?.passwordHash,
      );
    });
  });

  describe("/user (DELETE) V1", () => {
    it("Should delete user", async () => {
      const user = await createTestUserV1(app);

      const response = await request(app.getHttpServer())
        .delete(`/v1/user/${user.id}`)
        .expect(200);

      const reponseBody: DeletedUserApiResponseDtoV1 = response.body;

      expect(reponseBody).toEqual({
        id: expect.any(String),
        name: "John Doe",
        email: "john@email.com",
        deletedAt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userCredentials: {
          id: expect.any(String),
          lastLoginAt: null,
        },
      });

      const postDeletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(postDeletedUser?.deletedAt).not.toBeNull();
    });

    it("Should return 'BadRequestException' if user not found", async () => {
      const response = await request(app.getHttpServer())
        .delete("/v1/user/unexistent-id")
        .expect(400);

      expect(response.body).toEqual({
        message: ["Impossível excluir esse usuário."],
        error: "Bad Request",
        statusCode: 400,
      });
    });
  });
});
