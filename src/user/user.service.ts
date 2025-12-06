import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDtoV1 } from "./v1/dto/create-user.dto";
import { UserRepository } from "./user.repository";
import { HasherProtocol } from "src/common/hasher/hasher.protocol";
import { ICreateUser } from "./interfaces/create-user";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasherService: HasherProtocol,
  ) {}

  async create(userInputData: ICreateUser) {
    const { name, email, password: userPassword } = userInputData;

    const existingUser = await this.userRepository.findOneByEmail(email);

    if (existingUser) {
      throw new BadRequestException(
        "Falha ao criar o usuário. Verifique os dados fornecidos.",
      );
    }

    const newUser: CreateUserDtoV1 = {
      name,
      email,
      password: await this.hasherService.hash(userPassword),
    };

    return this.userRepository.create(newUser);
  }
}
