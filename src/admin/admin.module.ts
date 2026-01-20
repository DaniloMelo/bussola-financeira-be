import { Module } from "@nestjs/common";
import { AdminController } from "./controllers/v1/admin-user.controller";
import { AdminUserService } from "./services/admin-user.service";
import { CommonModule } from "src/common/common.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { AdminUserRepository } from "./repositories/admin-user.repository";

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [AdminController],
  providers: [AdminUserService, AdminUserRepository],
})
export class AdminModule {}
