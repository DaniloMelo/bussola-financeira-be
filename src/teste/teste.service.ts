import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user-dto";

@Injectable()
export class TesteService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(user: CreateUserDto) {
    return await this.prisma.user.create({
      data: user,
    });
  }

  async readAll() {
    return await this.prisma.user.findMany();
  }
}
