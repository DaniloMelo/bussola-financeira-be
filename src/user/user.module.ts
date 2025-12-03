import { Module } from "@nestjs/common";
import { UserController } from "./v1/user.controller";
import { UserService } from "./user.service";

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
