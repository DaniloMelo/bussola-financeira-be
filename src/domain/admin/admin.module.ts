import { Module } from "@nestjs/common";
import { CommonModule } from "src/common/common.module";
import { PrismaModule } from "src/infra/prisma/prisma.module";
import { AdminUserController } from "./user/controllers/v1/admin-user.controller";
import { AdminUserService } from "./user/services/admin-user.service";
import { AdminUserRepository } from "./user/repositories/admin-user.repository";
import { AdminApplicationController } from "./application/controllers/v1/admin-application.controller";
import { AdminApplicationService } from "./application/services/admin-application.service";
import { AdminApplicationRepository } from "./application/repositories/admin-application.repository";
import { EmailModule } from "src/infra/email/email.module";

@Module({
  imports: [PrismaModule, CommonModule, EmailModule],
  controllers: [AdminUserController, AdminApplicationController],
  providers: [
    AdminUserService,
    AdminUserRepository,
    AdminApplicationService,
    AdminApplicationRepository,
  ],
})
export class AdminModule {}
