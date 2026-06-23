import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AuthService } from "../../services/auth.service";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { JwtRefreshTokenGuard } from "../../guards/jwt-refresh-token.guard";
import { LoginDtoV1 } from "./dto/login.dto";
import { AuthApiResponseDto } from "./dto/swagger/auth-api-response.dto";
import { LogoutApiResponseDto } from "./dto/swagger/logout-api-response.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { UserPasswordService } from "src/domain/user/services/user-password.service";
import { RequestResetPasswordDtoV1 } from "./dto/request-reset-password.dto";

@Controller({ path: "auth", version: "1" })
@ApiTags("auth-v1")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userPasswordService: UserPasswordService,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login" })
  @ApiResponse({
    status: 200,
    description: "Retorna access token e refresh token",
    type: AuthApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos, ausentes ou recurso não encontrado",
    example: new BadRequestException(["Mensagem de exemplo"]).getResponse(),
  })
  login(@Body() loginData: LoginDtoV1) {
    return this.authService.login(loginData);
  }

  @Post("refresh")
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Atualizar tokens" })
  @ApiBearerAuth("refresh-token")
  @ApiHeader({
    name: "Authorization",
    description: "Bearer <refresh_token>",
  })
  @ApiResponse({
    status: 200,
    description: "Retorna access token e refresh token atualizados",
    type: AuthApiResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Sessão inválida ou expirada",
    example: new UnauthorizedException([
      "Sessão inválida ou expirada. Faça login novamente.",
    ]).getResponse(),
  })
  refreshTokens(
    @CurrentUser("id") userId: string,
    @CurrentUser("refreshToken") refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout" })
  @ApiBearerAuth("access-token")
  @ApiHeader({
    name: "Authorization",
    description: "Bearer <access_token>",
  })
  @ApiResponse({
    status: 200,
    description: "Retorna o usuário deslogado",
    type: LogoutApiResponseDto,
  })
  logout(@CurrentUser("id") userId: string) {
    return this.authService.logout(userId);
  }

  @Post("password/request-reset")
  @ApiOperation({ summary: "Solicita o reset de senha" })
  @ApiResponse({
    status: 200,
    description: "Solicitação enviada",
    example: {
      message:
        "Caso tenha um usuário cadastrado, receberá um email com instruções de como redefinir a sua senha.",
    },
  })
  requestResetPassword(@Body() userInputData: RequestResetPasswordDtoV1) {
    return this.userPasswordService.requestPasswordReset(userInputData);
  }
}
