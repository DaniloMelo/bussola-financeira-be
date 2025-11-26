import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  CreateUserParams,
  CreateUserResponse,
} from "./interfaces/user.interface";

@Injectable()
export class TesteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: CreateUserParams): Promise<CreateUserResponse> {
    return this.prisma.user.create({ data: userData });
  }

  async findAll(): Promise<CreateUserResponse[]> {
    return this.prisma.user.findMany();
  }
}
