import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";
import { Random } from "src/common/utils/random";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "src/infra/email/services/email.service";
import { RequestResetPasswordDtoV1 } from "src/infra/auth/controllers/v1/dto/request-reset-password.dto";
import { ResetPasswordDtoV1 } from "src/infra/auth/controllers/v1/dto/reset-password.dto";

@Injectable()
export class UserPasswordService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly hasherService: HasherProtocol,
    private readonly emailService: EmailService,
    private readonly random: Random,
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

    const token = this.random.text();
    const hashedToken = await this.hasherService.hash(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.userRepository.saveResetPasswordToken(
      existingUser.id,
      hashedToken,
      expiresAt,
    );

    const frontUrl = this.configService.get<string>("FRONTEND_URL_ORIGIN");
    const resetUrl = `${frontUrl}/reset-password?token=${token}&email=${encodeURIComponent(existingUser.email)}`;

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

  async resetPassword(resetPasswordParams: ResetPasswordDtoV1) {
    const { rawToken, email, password } = resetPasswordParams;

    const userData = await this.userRepository.findResetPasswordToken(email);

    if (
      !userData ||
      !userData.userCredentials?.resetPasswordTokenHash ||
      !userData.userCredentials?.resetPasswordExpiresAt
    ) {
      throw new UnauthorizedException(
        "Solicitação inválida. Faça uma nova solicitação ou tente novamente mais tarde.",
      );
    }

    const { userCredentials, id: userId, name: userName } = userData;
    const resetPasswordTokenHash = userCredentials.resetPasswordTokenHash!;
    const resetPasswordExpiresAt = userCredentials.resetPasswordExpiresAt!;

    const isValidToken = await this.hasherService.compare(
      rawToken,
      resetPasswordTokenHash,
    );
    if (!isValidToken) {
      await this.userRepository.invalidateResetPasswordToken(userId);

      throw new UnauthorizedException(
        "Solicitação inválida. Faça uma nova solicitação ou tente novamente mais tarde.",
      );
    }

    const now = new Date();
    if (now > resetPasswordExpiresAt) {
      await this.userRepository.invalidateResetPasswordToken(userId);

      throw new UnauthorizedException(
        "Solicitação expirada. Faça uma nova solicitação ou tente novamente mais tarde.",
      );
    }

    const newHashedPassword = await this.hasherService.hash(password);
    const updatedPassword = {
      name: undefined,
      email: undefined,
      password: newHashedPassword,
    };
    await this.userRepository.update(userId, updatedPassword);

    await this.userRepository.invalidateResetPasswordToken(userId);

    // TODO: Estudar sobre filas para envio de emails.
    await this.emailService.resetPasswordNotification({ userName, email });

    return {
      message: "Senha alterada com sucesso.",
    };
  }
}
