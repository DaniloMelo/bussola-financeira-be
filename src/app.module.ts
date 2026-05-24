import { Module } from "@nestjs/common";
import { PrismaModule } from "./infra/prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./domain/user/user.module";
import { AuthModule } from "./infra/auth/auth.module";
import { AdminModule } from "./domain/admin/admin.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
