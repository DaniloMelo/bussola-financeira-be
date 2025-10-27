/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "src/teste/dto/create-user-dto";
import { TesteModule } from "src/teste/teste.module";
import * as request from "supertest";
import { cleanDatabase } from "./utils/cleanDatabase";

describe("TesteController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, TesteModule],
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

    await app.init();
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  describe("/user (POST)", () => {
    it("Should successfully create a user", async () => {
      const validUser: CreateUserDto = {
        name: "John Doe",
        email: "john@email.com",
        password: "123456",
      };

      const response = await request(app.getHttpServer())
        .post("/user")
        .send(validUser);

      console.log(response.body);
    });
  });
});
