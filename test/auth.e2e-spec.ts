/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { INestApplication } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as request from "supertest";
import { ILogin } from "src/auth/interfaces/login.interface";
import { AuthApiResponseDto } from "src/auth/v1/dto/swagger/auth-api-response.dto";
import { TestDatabaseHelper } from "./helpers/test-database.helper";
import { TestAuthHelper } from "./helpers/test-auth.helper";
import { createTestApp, TestContext } from "./helpers/create-test-app.helper";
import { LogoutApiResponseDto } from "src/auth/v1/dto/swagger/logout-api-response.dto";

describe("Auth (e2e)", () => {
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

  describe("/v1/auth/login (POST)", () => {
    it("Should successfully login user and return tokens", async () => {
      const loginUserData: ILogin = {
        email: "john@email.com",
        password: "password123",
      };

      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send(loginUserData)
        .expect(200);

      const responseBody: AuthApiResponseDto = response.body;

      expect(responseBody).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });
    });

    it("Should return 'BadRequestException' for all validations errors", async () => {
      const loginUserData: ILogin = {
        email: "wrong-email-format",
        password: "short",
      };

      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send(loginUserData)
        .expect(400);

      expect(response.body).toEqual({
        message: [
          "E-mail inválido.",
          "Senha precisa ter o mínimo de 6 caracteres.",
        ],
        error: "Bad Request",
        statusCode: 400,
      });
    });

    it("Should return 'BadRequestException' if user don't exist", async () => {
      const loginUserData: ILogin = {
        email: "unexistent@email.com",
        password: "password123",
      };

      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send(loginUserData)
        .expect(400);

      expect(response.body).toEqual({
        message: ["Falha ao fazer login. Verifique suas credenciais."],
        error: "Bad Request",
        statusCode: 400,
      });
    });

    it("Should return 'BadRequestException' if password is incorrect", async () => {
      const invalidUser: ILogin = {
        email: regularUserCredentials.email,
        password: "invalid-password",
      };

      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send(invalidUser)
        .expect(400);

      expect(response.body).toEqual({
        message: ["Falha ao fazer login. Verifique suas credenciais."],
        error: "Bad Request",
        statusCode: 400,
      });
    });
  });

  describe("/v1/auth/refresh (POST)", () => {
    it("Should successfully refresh tokens and persist refresh-token", async () => {
      const { access_token, refresh_token } = await authHelper.login(
        app,
        regularUserCredentials,
      );

      const response = await request(app.getHttpServer())
        .post("/v1/auth/refresh")
        .set("Authorization", `Bearer ${refresh_token}`);

      const responseBody: AuthApiResponseDto = response.body;

      const postRefreshToken = await prisma.user.findUnique({
        where: {
          email: regularUserCredentials.email,
        },
        select: {
          userCredentials: {
            select: {
              refreshTokenHash: true,
            },
          },
        },
      });

      expect(responseBody).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });

      expect(access_token).not.toEqual(responseBody.access_token);

      expect(refresh_token).not.toEqual(responseBody.refresh_token);

      expect(postRefreshToken?.userCredentials?.refreshTokenHash).toBeDefined();
    });
  });

  describe("v1/auth/logout (POST)", () => {
    it("Should logout a user and set a null value for refresh token", async () => {
      const { access_token } = await authHelper.login(
        app,
        regularUserCredentials,
      );

      const response = await request(app.getHttpServer())
        .post("/v1/auth/logout")
        .set("Authorization", `Bearer ${access_token}`);

      const responseBody: LogoutApiResponseDto = response.body;

      expect(responseBody.userCredentials.refreshTokenHash).toBeNull();
    });
  });
});
