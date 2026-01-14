/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthModule } from "src/auth/auth.module";
import { AllExceptionsFilter } from "src/common/filters/all-exceptions-filter.filter";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import { cleanDatabase } from "./utils/clean-database";
import * as request from "supertest";
import { ILogin } from "src/auth/interfaces/login";
import { AuthApiResponseDto } from "src/auth/v1/dto/swagger/auth-api-response.dto";
import { createTestUserV1 } from "./utils/create-test-user-v1";
import { loginTestUserV1 } from "./utils/login-test-user-v1";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        AuthModule,
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

  describe("v1/auth/login (POST)", () => {
    it("Should successfully login user and return tokens", async () => {
      await createTestUserV1(app);

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
      await createTestUserV1(app);

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
      const { userApiResponse } = await createTestUserV1(app);

      const invalidUser: ILogin = {
        email: userApiResponse.email,
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

  describe("v1/auth/refresh (POST)", () => {
    it("Should successfully refresh tokens and persist refresh-token", async () => {
      const { userApiResponse, userInputData } = await createTestUserV1(app);

      const { access_token, refresh_token } = await loginTestUserV1(app, {
        email: userInputData.email,
        password: userInputData.password,
      });

      const response = await request(app.getHttpServer())
        .post("/v1/auth/refresh")
        .set("Authorization", `Bearer ${refresh_token}`);

      const responseBody: AuthApiResponseDto = response.body;

      const postRefreshToken = await prisma.userCredentials.findUnique({
        where: {
          userId: userApiResponse.id,
        },
      });

      expect(responseBody).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });

      expect(access_token).not.toEqual(responseBody.access_token);

      expect(refresh_token).not.toEqual(responseBody.refresh_token);

      expect(postRefreshToken?.refreshTokenHash).toBeDefined();
    });
  });

  describe("v1/auth/logout (POST)", () => {
    it("Should logout a user and set a null value for refresh token", async () => {
      const { userApiResponse, userInputData } = await createTestUserV1(app);

      const { access_token } = await loginTestUserV1(app, {
        email: userInputData.email,
        password: userInputData.password,
      });

      const response = await request(app.getHttpServer())
        .post("/v1/auth/logout")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.body).toEqual({
        id: userApiResponse.id,
        name: "John Doe",
        email: "john@email.com",
        deletedAt: null,
        createdAt: userApiResponse.createdAt,
        updatedAt: userApiResponse.updatedAt,
        userCredentials: {
          id: userApiResponse.userCredentials.id,
          lastLoginAt: expect.any(String),
          refreshTokenHash: null,
        },
        roles: [
          {
            name: "USER",
          },
        ],
      });
    });
  });
});
