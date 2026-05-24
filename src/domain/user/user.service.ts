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
      name: userData.name,
      email: userData.email,
      password: await this.hasherService.hash(userData.password),
    };

    return this.userRepository.create(newUser);
  }

  async findMe(userId: string) {
    return this.userRepository.findOneById(userId);
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async findOneByIdWithCredentials(userId: string) {
    return this.userRepository.findOneByIdWithCredentials(userId);
  }

  async findOneByEmailWithCredentials(email: string) {
    return this.userRepository.findOneByEmailWithCredentials(email);
  }

  async update(userId: string, userData: IUpdateUserData) {
    if (!userData.name && !userData.email && !userData.password) {
      throw new BadRequestException("Nenhum dado foi fornecido.");
    }

    const existingUser = await this.userRepository.findOneById(userId);
    if (!existingUser) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    const userDataToSave: IUpdateUserData = {
      name: userData.name ?? undefined,
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

  async saveRefreshTokenAndLastLoginAt(
    userId: string,
    refreshTokenHash: string,
  ) {
    return await this.userRepository.saveRefreshTokenAndLastLoginAt(
      userId,
      refreshTokenHash,
    );
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null) {
    return await this.userRepository.updateRefreshToken(
      userId,
      refreshTokenHash,
    );
  }
}
