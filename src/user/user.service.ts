import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { ICreateUser } from "./interfaces/user";
import { IUpdateUserData } from "./interfaces/update";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasherService: HasherProtocol,
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

    const newUser: ICreateUser = {
      ...userData,
      password: await this.hasherService.hash(userData.password),
    };

    return this.userRepository.create(newUser);
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async update(userId: string, userData: IUpdateUserData) {
    if (!userData.name && !userData.email && !userData.password) {
      throw new BadRequestException("Nenhum dado foi fornecido.");
    }

    // TODO: Verificar se é possível retirar essa verificação após a implmentação do payload na request e retirar route-params
    const existingUser = await this.userRepository.findOneById(userId);
    if (!existingUser) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    const userDataToSave: IUpdateUserData = { ...userData };

    if (userDataToSave.email) {
      const existingEmail = await this.userRepository.findOneByEmail(
        userDataToSave.email,
      );

      if (existingEmail) {
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
