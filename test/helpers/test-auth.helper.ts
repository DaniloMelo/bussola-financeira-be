/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Body, INestApplication } from "@nestjs/common";
import { ILogin } from "src/auth/interfaces/login.interface";
import { AuthApiResponseDto } from "src/auth/v1/dto/swagger/auth-api-response.dto";
import * as request from "supertest";

export class TestAuthHelper {
  async login(app: INestApplication, credentials: ILogin) {
    const response = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({
        email: credentials.email,
        password: credentials.password,
      });

    const loginResponse: AuthApiResponseDto = response.body;

    if (!loginResponse.access_token) {
      console.error("Login failed: ", {
        status: response.status,
        body: response.body,
        credentials: { email: credentials.email },
      });

      throw new Error(`Login failed for ${credentials.email}`);
    }

    return loginResponse;
  }
}
