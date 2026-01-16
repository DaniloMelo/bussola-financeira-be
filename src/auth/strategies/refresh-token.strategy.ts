import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { IJwtPayload } from "../interfaces/jwt-payload.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { IAuthUserWithRefreshToken } from "../interfaces/request-user.interface";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly hasher: HasherProtocol,
  ) {
    const secret = configService.getOrThrow<string>("JWT_REFRESH_SECRET");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: IJwtPayload,
  ): Promise<IAuthUserWithRefreshToken> {
    const refreshToken = req.get("Authorization")?.replace("Bearer", "").trim();

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token não fornecido.");
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
        deletedAt: null,
      },
      include: {
        userCredentials: {
          select: {
            refreshTokenHash: true,
          },
        },
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("Usuário não encontrado.");
    }

    const storedRefreshTokenHash = user?.userCredentials?.refreshTokenHash;

    if (!storedRefreshTokenHash) {
      throw new UnauthorizedException("Sessão inválida ou expirada.");
    }

    const isRefreshTokenMatches = await this.hasher.compare(
      refreshToken,
      storedRefreshTokenHash,
    );

    if (!isRefreshTokenMatches) {
      await this.prisma.userCredentials.update({
        where: {
          userId: payload.sub,
        },
        data: {
          refreshTokenHash: null,
        },
      });

      throw new UnauthorizedException("Token inválido. Faça login novamente.");
    }

    return {
      id: payload.sub,
      roles: payload.roles,
      refreshToken: refreshToken,
    };
  }
}
