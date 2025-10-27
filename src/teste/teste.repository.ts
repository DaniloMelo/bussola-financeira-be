import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user-dto";
import { UserEntity } from "./entities/user.entitie";

@Injectable()
export class TesteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: CreateUserDto): Promise<UserEntity> {
    return this.prisma.user.create({ data: userData });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.prisma.user.findMany();
  }
}
