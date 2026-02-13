/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { INestApplication } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as request from "supertest";
import { IUpdateUserData } from "src/user/interfaces/update";
import { UserApiResponseDtoV1 } from "src/user/v1/dto/swagger/user-api-response.dto";
import { DeletedUserApiResponseDtoV1 } from "src/user/v1/dto/swagger/deleted-user-api-response.dto";
import { TestDatabaseHelper } from "./helpers/test-database.helper";
import { ILogin } from "src/auth/interfaces/login.interface";
import { TestAuthHelper } from "./helpers/test-auth.helper";
import { createTestApp, TestContext } from "./helpers/create-test-app.helper";
import { FindMeWithRolesV1 } from "src/user/v1/dto/swagger/find-user-api.response";

describe("User (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let dbHelper: TestDatabaseHelper;
  let authHelper: TestAuthHelper;
  let regularUserCredentials: ILogin;

  beforeAll(async () => {
    const context: TestContext = await createTestApp();
    app = context.app;
    prisma = context.prisma;
    dbHelper = context.dbHelper;
    authHelper = context.authHelper;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const userData = await dbHelper.setupTestDatabase();
    regularUserCredentials = userData.regularUserCredentials;
  });

  describe("/v1/user (POST)", () => {
    it("Should create and persist a user using V1", async () => {
      const newUser = {
        name: "Jane Doe",
        email: "jane@email.com",
        password: "password123",
      };

      const response = await request(app.getHttpServer())
        .post("/v1/user")
        .send(newUser)
        .expect(201);

      const reponseBody: UserApiResponseDtoV1 = response.body;

      expect(reponseBody).toEqual({
        id: expect.any(String),
        name: "Jane Doe",
        email: "jane@email.com",
        deletedAt: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userCredentials: {
          id: expect.any(String),
          lastLoginAt: null,
        },
        roles: [
          {
            name: "USER",
          },
        ],
      });

      const storedUser = await prisma.user.findUnique({
        where: {
          id: reponseBody.id,
        },
        include: {
          userCredentials: true,
          roles: true,
        },
      });

      expect(storedUser).toBeDefined();

      expect(storedUser?.name).toBe(newUser.name);

      expect(storedUser?.email).toBe(newUser.email);

      expect(storedUser?.userCredentials?.passwordHash).toBeDefined();

      expect(storedUser?.userCredentials?.passwordHash).not.toBe(
        newUser.password,
      );

      expect(storedUser?.roles[0].name).toBe("USER");
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

  describe("/v2/user (POST)", () => {
    it("Should create a user using V2", async () => {
      const newUser = {
        userName: "Jane Doe",
        userEmail: "jane@email.com",
        userPassword: "password123",
      };

      const response = await request(app.getHttpServer())
        .post("/v2/user")
        .send(newUser)
        .expect(201);

      const responseBody: UserApiResponseDtoV1 = response.body;

      expect(responseBody).toEqual({
        id: expect.any(String),
        userName: "Jane Doe",
        userEmail: "jane@email.com",
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

  describe("/v1/user/me (GET)", () => {
    it("Should find my user when authenticated", async () => {
      const { access_token } = await authHelper.login(
        app,
        regularUserCredentials,
      );

      const response = await request(app.getHttpServer())
        .get("/v1/user/me")
        .set("Authorization", `Bearer ${access_token}`)
        .expect(200);

      const responseBody: FindMeWithRolesV1 = await response.body;

      expect(responseBody).toEqual({
        id: expect.any(String),
        name: "John Doe",
        email: "john@email.com",
        deletedAt: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        roles: [
          {
            name: "USER",
          },
        ],
      });
    });

    it("Should return 401 when not authenticated", async () => [
      await request(app.getHttpServer()).get("/v1/user/me").expect(401),
    ]);
  });

  describe("/v1/user/me (PATCH)", () => {
    it("Should update 'name' only", async () => {
      const { access_token } = await authHelper.login(
        app,
        regularUserCredentials,
      );

      const dataToUpdate: IUpdateUserData = {
        name: "John Doe UPDATED",
      };

      const preUpdateStoredUser = await prisma.user.findUnique({
        where: {
          email: regularUserCredentials.email,
        },
        include: {
          userCredentials: {
            select: {
              passwordHash: true,
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .patch("/v1/user/me")
        .set("Authorization", `Bearer ${access_token}`)
        .send(dataToUpdate)
        .expect(200);

      const responseBody: UserApiResponseDtoV1 = response.body;

      expect(responseBody).toEqual({
        id: expect.any(String),
        name: "John Doe UPDATED",
        email: "john@email.com",
        deletedAt: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userCredentials: {
          id: expect.any(String),
          lastLoginAt: expect.any(String),
        },
        roles: [
          {
            name: "USER",
          },
        ],
      });

      const postUpdateStoredUser = await prisma.user.findUnique({
        where: {
          email: regularUserCredentials.email,
        },
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
      const { access_token } = await authHelper.login(
        app,
        regularUserCredentials,
      );

      const invalidDataToUpdate: IUpdateUserData = {
        name: "Jo",
        email: "invalid_email",
        password: "pass",
      };

      const response = await request(app.getHttpServer())
        .patch("/v1/user/me")
        .set("Authorization", `Bearer ${access_token}`)
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
      const userA = await dbHelper.createRegularUser({
        name: "User A",
        email: "user_a@email.com",
        passowrd: "password123",
      });

      const { access_token } = await authHelper.login(app, {
        email: userA.email,
        password: userA.password,
      });

      await dbHelper.createRegularUser({
        name: "User B",
        email: "user_b@email.com",
        passowrd: "password123",
      });

      const dataToUpdate: IUpdateUserData = {
        email: "user_b@email.com",
      };

      const response = await request(app.getHttpServer())
        .patch("/v1/user/me")
        .set("Authorization", `Bearer ${access_token}`)
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
      const { access_token } = await authHelper.login(
        app,
        regularUserCredentials,
      );

      const dataToUpdate: IUpdateUserData = {
        password: "new_password_123",
      };

      const preUpdatePasswordHash = await prisma.user.findUnique({
        where: {
          email: regularUserCredentials.email,
        },
        select: {
          userCredentials: {
            select: {
              passwordHash: true,
            },
          },
        },
      });

      await request(app.getHttpServer())
        .patch("/v1/user/me")
        .set("Authorization", `Bearer ${access_token}`)
        .send(dataToUpdate)
        .expect(200);

      const postUpdatePasswordHash = await prisma.user.findUnique({
        where: {
          email: regularUserCredentials.email,
        },
        select: {
          userCredentials: {
            select: {
              passwordHash: true,
            },
          },
        },
      });

      expect(postUpdatePasswordHash?.userCredentials?.passwordHash).not.toBe(
        dataToUpdate.password,
      );

      expect(preUpdatePasswordHash?.userCredentials?.passwordHash).not.toBe(
        postUpdatePasswordHash?.userCredentials?.passwordHash,
      );
    });

    it("Should return 401 when not authenticated", async () => {
      await request(app.getHttpServer()).patch("/v1/user/me").expect(401);
    });
  });

  describe("/v1/user/me (DELETE) V1", () => {
    it("Should delete a user softly", async () => {
      const { access_token } = await authHelper.login(
        app,
        regularUserCredentials,
      );

      const response = await request(app.getHttpServer())
        .delete("/v1/user/me")
        .set("Authorization", `Bearer ${access_token}`)
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
          lastLoginAt: expect.any(String),
        },
        roles: [
          {
            name: "USER",
          },
        ],
      });

      const postDeletedUser = await prisma.user.findUnique({
        where: { email: regularUserCredentials.email },
      });

      expect(postDeletedUser?.deletedAt).not.toBeNull();
    });

    it("Should return 401 when not authenticated", async () => {
      await request(app.getHttpServer()).delete("/v1/user/me").expect(401);
    });
  });
});
