import { Module } from "@nestjs/common";
import { UserControllerV1 } from "./v1/user.controller";
import { UserControllerV2 } from "./v2/user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { PrismaModule } from "src/infra/prisma/prisma.module";
import { CommonModule } from "src/common/common.module";
import { EmailModule } from "src/infra/email/email.module";

@Module({
  imports: [PrismaModule, CommonModule, EmailModule],
  controllers: [UserControllerV1, UserControllerV2],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
