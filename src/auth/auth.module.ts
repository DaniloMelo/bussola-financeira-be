import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./v1/auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserModule } from "src/user/user.module";
import { CommonModule } from "src/common/common.module";

@Module({
  imports: [
    UserModule,
    PrismaModule,
    CommonModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          issuer: configService.get<string>("JWT_ISS"),
          audience: configService.get<string>("JWT_AUD"),
          expiresIn: Number(configService.get<string>("JWT_EXP")),
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
