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
import { AuthService } from "../auth.service";
import { LoginDtoV1 } from "./dto/login.dto";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthApiResponseDto } from "./dto/swagger/auth-api-response.dto";
import { IRequestRefreshToken } from "../interfaces/request-refresh-tokens";
import { AuthGuard } from "@nestjs/passport";

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
  @ApiOperation({ summary: "Atualizar token" })
  @ApiBearerAuth("refresh-token")
  @ApiHeader({
    name: "Authorization",
    description: "Bearer <refresh_token>",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Retorna access token e refresh token atualizados",
    type: AuthApiResponseDto,
  })
  refreshTokens(@Req() req: IRequestRefreshToken) {
    return this.authService.refreshTokens(req.user.sub, req.user.refreshToken);
  }
}
