import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JsonWebTokenError } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";

export class JwtRefreshTokenGuard extends AuthGuard("jwt-refresh") {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (!user || info instanceof JsonWebTokenError) {
      throw new UnauthorizedException(
        "Sessão inválida ou expirada. Faça login novamente.",
      );
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
