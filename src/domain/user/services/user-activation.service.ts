import { BadRequestException, Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";
import { ActivateUserDtoV1 } from "src/infra/auth/controllers/v1/dto/activate-user.dto";
import { ActivationCodeProtocol } from "src/common/activation-code/activation-code.protocol";
import { ResendActivationCodeDtoV1 } from "src/infra/auth/controllers/v1/dto/resend-activation-code.dto";

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
  }

  async resendActivationCode(userInputData: ResendActivationCodeDtoV1) {
    const { email } = userInputData;
    const result = await this.userRepository.findActivationCode(email);

    if (!result || !result.userCredentials) {
      throw new BadRequestException(
        "Impossível enviar novo código de ativação.",
      );
    }

    const { activationCode, activationCodeExpiresAt, activationCodeAttempts } =
      result.userCredentials;

    if (activationCodeAttempts >= 3) {
      throw new BadRequestException("Atingiu o número máximo de tentativas.");
    }

    if (!activationCode || !activationCodeExpiresAt) {
      throw new BadRequestException("Usuário já ativado.");
    }

    const newCode = this.activationCodeService.generate();
    const newCodeHash = this.activationCodeService.hash(newCode);
    const newExp = this.activationCodeService.generateExp();

    //TODO: Apagar depois
    console.log("NEW CODE ===> ", newCode);

    return await this.userRepository.updateActivationCode({
      email: email,
      activationCode: newCodeHash,
      activationCodeExp: newExp,
    });
  }
}
