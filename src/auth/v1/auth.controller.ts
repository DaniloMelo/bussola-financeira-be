import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { LoginDtoV1 } from "./dto/login.dto";
import { ApiTags } from "@nestjs/swagger";

@Controller({ path: "auth", version: "1" })
@ApiTags("auth-v1")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() loginData: LoginDtoV1) {
    return this.authService.login(loginData);
  }
}
