import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  create() {
    console.log("Hello from userService");
  }
}
