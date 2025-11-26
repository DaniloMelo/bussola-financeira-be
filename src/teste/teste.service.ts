import { Injectable } from "@nestjs/common";
import { TesteRepository } from "./teste.repository";
import { CreateUserParams } from "./interfaces/user.interface";

@Injectable()
export class TesteService {
  constructor(private readonly userRepository: TesteRepository) {}

  async createUser(user: CreateUserParams) {
    return await this.userRepository.create(user);
  }

  async readAll() {
    console.log();
    return await this.userRepository.findAll();
  }
}
