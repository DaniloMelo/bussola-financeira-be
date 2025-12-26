import { BadRequestException, Injectable } from "@nestjs/common";
import { ILogin } from "./interfaces/login";
import { UserService } from "src/user/user.service";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { JwtService } from "@nestjs/jwt";
import { IJwtPayload } from "./interfaces/jwt-payload";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hasherService: HasherProtocol,
    private readonly jwtService: JwtService,
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

    const jwtPayload: IJwtPayload = {
      sub: existingUser.id,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload);

    return {
      access_token: accessToken,
    };
  }
}
