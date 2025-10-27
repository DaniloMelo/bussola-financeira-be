import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user-dto";
import { TesteRepository } from "./teste.repository";

@Injectable()
export class TesteService {
  constructor(private readonly userRepository: TesteRepository) {}

  async createUser(user: CreateUserDto) {
    return await this.userRepository.create(user);
  }

  async readAll() {
    return await this.userRepository.findAll();
  }
}
