import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { IRequestRefreshToken } from "../interfaces/request-refresh-tokens";
import { IRequestUser } from "../interfaces/request-user";
import { LoginDtoV1 } from "./dto/login.dto";
import { AuthApiResponseDto } from "./dto/swagger/auth-api-response.dto";
import { LogoutApiResponseDto } from "./dto/swagger/logout-api-response.dto";

@Controller({ path: "auth", version: "1" })
@ApiTags("auth-v1")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @UseGuards(AuthGuard("jwt-refresh"))
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
  refreshTokens(@Req() req: IRequestRefreshToken) {
    return this.authService.refreshTokens(req.user.sub, req.user.refreshToken);
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
  logout(@Req() req: IRequestUser) {
    return this.authService.logout(req.user.id);
  }
}
