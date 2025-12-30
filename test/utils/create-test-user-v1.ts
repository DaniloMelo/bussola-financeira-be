/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { INestApplication } from "@nestjs/common";
import { IUpdateUserData } from "src/user/interfaces/update";
import { ICreateUser } from "src/user/interfaces/user";
import { UserApiResponseDtoV1 } from "src/user/v1/dto/swagger/user-api-response.dto";
import * as request from "supertest";

export async function createTestUserV1(
  app: INestApplication,
  userData?: IUpdateUserData,
) {
  const user = {
    name: userData?.name ? userData.name : "John Doe",
    email: userData?.email ? userData.email : "john@email.com",
    password: userData?.password ? userData.password : "password123",
  };

  const response = await request(app.getHttpServer())
    .post("/v1/user")
    .send(user);

  const userApiResponse = response.body as UserApiResponseDtoV1;
  const userInputData = user as ICreateUser;

  return {
    userApiResponse,
    userInputData,
  };
}
