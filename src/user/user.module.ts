import { Module } from "@nestjs/common";
import { UserControllerV1 } from "./v1/user.controller";
import { UserControllerV2 } from "./v2/user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { PrismaModule } from "src/prisma/prisma.module";
import { CommonModule } from "src/common/common.module";

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [UserControllerV1, UserControllerV2],
  providers: [UserService, UserRepository],
})
export class UserModule {}
