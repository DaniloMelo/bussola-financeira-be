import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AdminModule } from "src/admin/admin.module";
import { AuthModule } from "src/auth/auth.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import { UserModule } from "src/user/user.module";
import { TestDatabaseHelper } from "./test-database.helper";
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { AllExceptionsFilter } from "src/common/filters/all-exceptions-filter.filter";
import { TestAuthHelper } from "./test-auth.helper";
import { TestJwtHelper } from "./test-jwt.helper";
import { JwtService } from "@nestjs/jwt";

export interface TestContext {
  app: INestApplication;
  prisma: PrismaService;
  dbHelper: TestDatabaseHelper;
  authHelper: TestAuthHelper;
  jwtHelper: TestJwtHelper;
}

export async function createTestApp(): Promise<TestContext> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
      }),
      PrismaModule,
      UserModule,
      AuthModule,
      AdminModule,
    ],
  }).compile();

  const app = module.createNestApplication();
  const prisma = module.get<PrismaService>(PrismaService);
  const jwtService = module.get<JwtService>(JwtService);
  const configService = module.get<ConfigService>(ConfigService);

  const dbHelper = new TestDatabaseHelper(prisma);
  const authHelper = new TestAuthHelper();
  const jwtHelper = new TestJwtHelper(jwtService, configService);

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

  return {
    app,
    prisma,
    dbHelper,
    authHelper,
    jwtHelper,
  };
}
