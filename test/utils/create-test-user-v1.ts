/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

export async function createTestUserV1(app: INestApplication) {
  const user = {
    name: "John Doe",
    email: "john@email.com",
    password: "password123",
  };
  await request(app.getHttpServer()).post("/v1/user").send(user);
}
