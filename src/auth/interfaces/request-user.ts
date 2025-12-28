import { Request } from "express";
import { IStoredUser } from "src/user/interfaces/user";

export interface IRequestUser extends Request {
  user: IStoredUser;
}
