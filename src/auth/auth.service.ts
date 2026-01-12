import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ILogin } from "./interfaces/login";
import { UserService } from "src/user/user.service";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { JwtService } from "@nestjs/jwt";
import { IJwtPayload } from "./interfaces/jwt-payload";
import { ConfigService } from "@nestjs/config";
import { Random } from "src/common/utils/random";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hasherService: HasherProtocol,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginData: ILogin) {
    const existingUser = await this.userService.findOneByEmailWithCredentials(
      loginData.email,
    );

    if (!existingUser) {
      throw new BadRequestException(
        "Falha ao fazer login. Verifique suas credenciais.",
      );
    }

    const isPasswordCorrect = await this.hasherService.compare(
      loginData.password,
      existingUser.userCredentials!.passwordHash,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException(
        "Falha ao fazer login. Verifique suas credenciais.",
      );
    }

    const tokens = await this.generateJwtTokens(existingUser.id);

    const refreshTokenHash = await this.hasherService.hash(
      tokens.refresh_token,
    );

    // await this.userService.updateRefreshToken(
    //   existingUser.id,
    //   refreshTokenHash,
    // );

    await this.userService.saveRefreshTokenAndLastLoginAt(
      existingUser.id,
      refreshTokenHash,
    );

    return tokens;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const existingUser =
      await this.userService.findOneByIdWithCredentials(userId);

    if (!existingUser || !existingUser.userCredentials?.refreshTokenHash) {
      throw new ForbiddenException("Acesso negado.");
    }

    const refreshTokenMatches = await this.hasherService.compare(
      refreshToken,
      existingUser.userCredentials.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException("Acesso negado.");
    }

    const tokens = await this.generateJwtTokens(existingUser.id);

    const refreshTokenHash = await this.hasherService.hash(
      tokens.refresh_token,
    );

    await this.userService.updateRefreshToken(
      existingUser.id,
      refreshTokenHash,
    );

    return tokens;
  }

  private async generateJwtTokens(id: string) {
    const payload: IJwtPayload = { sub: id };

    const jwtAccessTokenSecret = this.configService.get<string>("JWT_SECRET");
    const jwtAccessTokenExp = Number(this.configService.get<string>("JWT_EXP"));

    const jwtRefreshTokenSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET");
    const jwtRefreshTokenExp = Number(
      this.configService.get<string>("JWT_REFRESH_EXP"),
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, jti: new Random().text() },
        {
          secret: jwtAccessTokenSecret,
          expiresIn: jwtAccessTokenExp,
        },
      ),
      this.jwtService.signAsync(
        { ...payload, jti: new Random().text() },
        {
          secret: jwtRefreshTokenSecret,
          expiresIn: jwtRefreshTokenExp,
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
