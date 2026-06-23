import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";
import { Random } from "src/common/utils/random";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "src/infra/email/services/email.service";
import { RequestResetPasswordDtoV1 } from "src/infra/auth/controllers/v1/dto/request-reset-password.dto";

@Injectable()
export class UserPasswordService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly hasherService: HasherProtocol,
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(userInputData: RequestResetPasswordDtoV1) {
    const existingUser =
      await this.userRepository.findOneByEmailWithCredentials(
        userInputData.email,
      );

    if (!existingUser) {
      return {
        message:
          "Caso tenha um usuário cadastrado e válido, receberá um email com instruções de como redefinir a sua senha.",
      };
    }

    const token = new Random().text();
    const hashedToken = await this.hasherService.hash(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.userRepository.saveResetPasswordToken(
      existingUser.id,
      hashedToken,
      expiresAt,
    );

    const frontUrl = this.configService.get<string>("FRONTEND_URL_ORIGIN");
    const resetUrl = `${frontUrl}/reset-password?token=${token}`;

    // TODO: Estudar sobre filas para envio de emails.
    await this.emailService.resetPassword({
      email: existingUser.email,
      userName: existingUser.name,
      resetUrl: resetUrl,
    });

    return {
      message:
        "Caso tenha um usuário cadastrado e válido, receberá um email com instruções de como redefinir a sua senha.",
    };
  }

  // resetPassword(token: string, password: string) {}
}
