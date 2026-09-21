import { BadRequestException, Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";
import { ActivateUserDtoV1 } from "src/infra/auth/controllers/v1/dto/activate-user.dto";
import { ActivationCodeProtocol } from "src/common/activation-code/activation-code.protocol";

@Injectable()
export class UserActivationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly activationCodeService: ActivationCodeProtocol,
  ) {}

  async activateUser(activateUserDto: ActivateUserDtoV1) {
    const { rawCode, email } = activateUserDto;

    const result = await this.userRepository.findActivationCode(email);

    if (!result || !result.userCredentials) {
      throw new BadRequestException("Impossível ativar o usuário.");
    }

    const { activationCode, activationCodeExpiresAt, activationCodeAttempts } =
      result.userCredentials;

    if (activationCodeAttempts >= 3) {
      throw new BadRequestException("Atingiu o Número máximo de tentativas.");
    }

    if (!activationCode || !activationCodeExpiresAt) {
      throw new BadRequestException("Usuário já ativado.");
    }

    const isExpired = this.activationCodeService.verifyExp(
      activationCodeExpiresAt,
    );

    if (isExpired) {
      throw new BadRequestException("Código de ativação expirado.");
    }

    const isValid = this.activationCodeService.verify(rawCode, activationCode);

    if (!isValid) {
      await this.userRepository.updateActivationCodeAttempts(email);
      throw new BadRequestException("Código de ativação inválido.");
    }

    return await this.userRepository.activateUser(email);

    // return {
    //   message: "Usuário ativado com sucesso.",
    // };
  }

  // async requestNewCode() {}
}
