import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./v1/auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          issuer: configService.get<string>("JWT_ISS"),
          audience: configService.get<string>("JWT_AUD"),
          expiresIn: configService.get<number>("JWT_EXP"),
        },
      }),
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
