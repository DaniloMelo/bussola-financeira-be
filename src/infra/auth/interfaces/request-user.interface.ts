import { Request } from "express";

export interface IAuthUser {
  id: string;
  roles: string[];
}

export interface IAuthUserWithRefreshToken extends IAuthUser {
  refreshToken: string;
}

export interface IRequestWithUser extends Request {
  user: IAuthUser;
}

export interface IRequestWithUserAndRefreshToken extends Request {
  user: IAuthUserWithRefreshToken;
}
