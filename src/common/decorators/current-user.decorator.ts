import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { IAuthUserWithRefreshToken } from "src/auth/interfaces/request-user.interface";

type UserProperties = keyof IAuthUserWithRefreshToken;

export const CurrentUser = createParamDecorator(
  (data: UserProperties | undefined, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();

    const user = request.user as IAuthUserWithRefreshToken;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
