/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { INestApplication } from "@nestjs/common";
// import { PrismaService } from "src/prisma/prisma.service";
import * as request from "supertest";
import { createTestApp, TestContext } from "./helpers/create-test-app.helper";
import { TestDatabaseHelper } from "./helpers/test-database.helper";
import { TestAuthHelper } from "./helpers/test-auth.helper";
import { ILogin } from "src/auth/interfaces/login.interface";
import { AdminFindAllApiResponseDtoV1 } from "src/admin/controllers/v1/dto/swagger/admin-find-all-api-response.dto";

describe("Admin (e2e)", () => {
  let app: INestApplication;
  // let prisma: PrismaService;
  let dbHelper: TestDatabaseHelper;
  let authHelper: TestAuthHelper;
  let adminUserCredentials: ILogin;
  let regularUserCredentials: ILogin;

  beforeAll(async () => {
    const context: TestContext = await createTestApp();
    app = context.app;
    // prisma = context.prisma;
    dbHelper = context.dbHelper;
    authHelper = context.authHelper;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const userData = await dbHelper.setupTestDatabase();
    adminUserCredentials = userData.adminUserCredentials;
    regularUserCredentials = userData.regularUserCredentials;
  });

  it("should return all stored users when authenticated as admin", async () => {
    const { access_token } = await authHelper.login(app, adminUserCredentials);

    const response = await request(app.getHttpServer())
      .get("/v1/admin?limit=10&offset=0")
      .set("Authorization", `Bearer ${access_token}`)
      .expect(200);

    const responseBody: AdminFindAllApiResponseDtoV1[] = response.body;

    expect(responseBody).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("Should return 401 when not authenticated", async () => {
    await request(app.getHttpServer())
      .get("/v1/admin?limit=10&offset=0")
      .expect(401);
  });

  it("Should return 403 when authenticated as regular user", async () => {
    const { access_token } = await authHelper.login(
      app,
      regularUserCredentials,
    );

    await request(app.getHttpServer())
      .get("/v1/admin?limit=10&offset=0")
      .set("Authorization", `Bearer ${access_token}`)
      .expect(403);
  });
});
