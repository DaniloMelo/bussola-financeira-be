import { Module } from "@nestjs/common";
import { UserControllerV1 } from "./controllers/v1/user.controller";
import { UserControllerV2 } from "./controllers/v2/user.controller";
import { UserService } from "./services/user.service";
import { UserRepository } from "./user.repository";
import { PrismaModule } from "src/infra/prisma/prisma.module";
import { CommonModule } from "src/common/common.module";
import { EmailModule } from "src/infra/email/email.module";
import { UserAuthService } from "./services/user-auth.service";
import { UserPasswordService } from "./services/user-password.service";

@Module({
  imports: [PrismaModule, CommonModule, EmailModule],
  controllers: [UserControllerV1, UserControllerV2],
  providers: [
    UserRepository,
    UserService,
    UserAuthService,
    UserPasswordService,
  ],
  exports: [UserService, UserAuthService, UserPasswordService],
})
export class UserModule {}
