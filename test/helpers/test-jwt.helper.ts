import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { IJwtPayload } from "src/auth/interfaces/jwt-payload.interface";
import { Random } from "src/common/utils/random";

export class TestJwtHelper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createExpiredAccessToken(userId: string) {
    const payload: IJwtPayload = {
      sub: userId,
      roles: ["USER"],
    };

    return await this.jwtService.signAsync(
      { ...payload, jti: new Random().text() },
      {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: "-1s",
      },
    );
  }

  async createExpiredRefreshToken(userId: string) {
    const payload: IJwtPayload = {
      sub: userId,
      roles: ["USER"],
    };

    return await this.jwtService.signAsync(
      { ...payload, jti: new Random().text() },
      {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: "-1s",
      },
    );
  }
}
