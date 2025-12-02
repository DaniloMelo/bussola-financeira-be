import { Injectable } from "@nestjs/common";
import { TesteRepository } from "./teste.repository";
import {
  CreateUserParams,
  CreateUserResponse,
} from "./interfaces/user.interface";

@Injectable()
export class TesteService {
  constructor(private readonly userRepository: TesteRepository) {}

  async createUser(user: CreateUserParams): Promise<CreateUserResponse> {
    return await this.userRepository.create(user);
  }

  async readAll() {
    console.log();
    return await this.userRepository.findAll();
  }
}
