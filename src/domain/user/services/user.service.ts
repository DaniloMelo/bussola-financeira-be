import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserRepository } from "../user.repository";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { ICreateUser } from "../interfaces/user";
import { IUpdateUserData } from "../interfaces/update";
import { EmailService } from "src/infra/email/email.service";
import { SanitizeProtocol } from "src/common/sanitize/sanitize.protocol";
import { USER_CONSTANTS } from "../utils/constants/user.constant";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasherService: HasherProtocol,
    private readonly sanitizeService: SanitizeProtocol,
    private readonly emailService: EmailService,
  ) {}

  async create(userData: ICreateUser) {
    const existingUser = await this.userRepository.findOneByEmail(
      userData.email,
    );

    if (existingUser) {
      throw new BadRequestException(
        "Falha ao criar o usuário. Verifique os dados fornecidos.",
      );
    }

    const sanitizedName = this.sanitizeService.sanitizeAll(userData.name);
    if (sanitizedName.length < USER_CONSTANTS.NAME.MIN_LENGTH) {
      throw new BadRequestException("Nome precisa conter caracteres válidos.");
    }

    const newUser: ICreateUser = {
      name: sanitizedName,
      email: userData.email,
      password: await this.hasherService.hash(userData.password),
    };

    // await this.emailService.resetPassword({
    //   userName: userData.name,
    //   email: userData.email,
    //   resetUrl: "https://www.google.com",
    // });

    return this.userRepository.create(newUser);
  }

  async findMe(userId: string) {
    return this.userRepository.findOneById(userId);
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async update(userId: string, userData: IUpdateUserData) {
    if (!userData.name && !userData.email && !userData.password) {
      throw new BadRequestException("Nenhum dado foi fornecido.");
    }

    const existingUser = await this.userRepository.findOneById(userId);
    if (!existingUser) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    let sanitizedName: string | undefined = undefined;
    if (userData.name) {
      sanitizedName = this.sanitizeService.sanitizeAll(userData.name);

      if (sanitizedName.length < USER_CONSTANTS.NAME.MIN_LENGTH) {
        throw new BadRequestException(
          "Nome precisa conter caracteres válidos.",
        );
      }
    }

    const userDataToSave: IUpdateUserData = {
      name: sanitizedName,
      email: userData.email ?? undefined,
      password: userData.password ?? undefined,
    };

    if (userDataToSave.email) {
      const existingUser = await this.userRepository.findOneByEmail(
        userDataToSave.email,
      );

      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException(
          "Impossível atualizar o seu usuário. Verifique as suas credenciais e tente novamente.",
        );
      }
    }

    if (userData.password) {
      userDataToSave.password = await this.hasherService.hash(
        userData.password,
      );
    }

    return await this.userRepository.update(userId, userDataToSave);
  }

  async softDelete(userId: string) {
    const existingUser = await this.userRepository.findOneById(userId);
    if (!existingUser) {
      throw new BadRequestException("Impossível excluir esse usuário.");
    }

    return await this.userRepository.softDelete(userId);
  }
}
