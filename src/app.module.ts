import { Module } from "@nestjs/common";
import { PrismaModule } from "./infra/prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./domain/user/user.module";
import { AuthModule } from "./infra/auth/auth.module";
import { AdminModule } from "./domain/admin/admin.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    AdminModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
