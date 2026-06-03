import { Module } from "@nestjs/common";
import { PrismaModule } from "./infra/prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./domain/user/user.module";
import { AuthModule } from "./infra/auth/auth.module";
import { AdminModule } from "./domain/admin/admin.module";
import { AppController } from "./app.controller";
import { EmailModule } from "./infra/email/email.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EmailModule,
    UserModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
