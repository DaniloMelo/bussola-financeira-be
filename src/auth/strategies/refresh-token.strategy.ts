import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { IJwtPayload } from "../interfaces/jwt-payload";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>("JWT_REFRESH_SECRET");
    if (!secret) {
      throw new InternalServerErrorException("JWT_REFRESH_SECRET not found");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: IJwtPayload) {
    const refreshToken = req.get("Authorization")?.replace("Bearer", "").trim();
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    return { ...payload, refreshToken };
  }
}
