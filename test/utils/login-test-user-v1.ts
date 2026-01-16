/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { INestApplication } from "@nestjs/common";
import { ILogin } from "src/auth/interfaces/login.interface";
import { AuthApiResponseDto } from "src/auth/v1/dto/swagger/auth-api-response.dto";
import * as request from "supertest";

export async function loginTestUserV1(
  app: INestApplication,
  loginUserData: ILogin,
) {
  const response = await request(app.getHttpServer())
    .post("/v1/auth/login")
    .send(loginUserData);

  return response.body as AuthApiResponseDto;
}
