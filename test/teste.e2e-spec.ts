/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import { TesteModule } from "src/teste/teste.module";
import * as request from "supertest";
import { cleanDatabase } from "./utils/cleanDatabase";
import { ConfigModule } from "@nestjs/config";

describe("TesteController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        TesteModule,
        ConfigModule.forRoot({ isGlobal: true }),
      ],
    }).compile();

    app = module.createNestApplication();

    prisma = app.get<PrismaService>(PrismaService);

    app.enableShutdownHooks();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableVersioning({
      type: VersioningType.URI,
    });

    await app.init();
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  describe("/user (POST) - v1", () => {
    it("Should successfully create a user using v1", async () => {
      const validUserV1 = {
        name: "John Doe",
        email: "john@email.com",
        password: "123456",
      };

      const response = await request(app.getHttpServer())
        .post("/v1/user")
        .send(validUserV1);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: "John Doe",
        email: "john@email.com",
        password: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe("/user (POST) - v2", () => {
    it("Should successfully create a user using v2", async () => {
      const validUserV2 = {
        userName: "John Doe",
        userEmail: "john@email.com",
        password: "123456",
      };

      const response = await request(app.getHttpServer())
        .post("/v2/user")
        .send(validUserV2);

      expect(response.body).toEqual({
        id: expect.any(String),
        userName: "John Doe",
        userEmail: "john@email.com",
        password: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});
