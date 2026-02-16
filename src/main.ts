import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { swaggerBasicAuthMiddleware } from "./common/middlewares/swagger-basic-auth.middleware";
import { AllExceptionsFilter } from "./common/filters/all-exceptions-filter.filter";
import { getCorsConfig } from "./common/configs/get-cors.config";

async function bootstrap() {
  const SWAGGER_PATH = process.env.SWAGGER_PATH;
  const PORT = process.env.PORT ?? 3001;

  const app = await NestFactory.create(AppModule);

  app.enableCors(getCorsConfig());

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

  const config = new DocumentBuilder()
    .setTitle("Bússola financeira | API reference")
    .setDescription(
      "API Para acesso ao backend da aplicação Bússola financeira",
    )
    .setVersion("1.0")
    .addTag("auth-v1")
    .addTag("user-v1")
    .addTag("user-v2")
    .addTag("admin-v1")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Bearer <access-token>",
      },
      "access-token",
    )
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Bearer <refresh-token>",
      },
      "refresh-token",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    `/${SWAGGER_PATH}`,
    (req: Request, res: Response, next: NextFunction) =>
      swaggerBasicAuthMiddleware(req, res, next),
  );

  SwaggerModule.setup(SWAGGER_PATH!, app, document);

  await app.listen(PORT);

  if (process.env.NODE_ENV === "development") {
    console.info(`💻 Developtment server: http://localhost:${PORT}/`);
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `📜 API documentation: http://localhost:${PORT}/${SWAGGER_PATH!}`,
    );
  }
}
void bootstrap();
