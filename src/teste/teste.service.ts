import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

export type UserType = {
  name: string;
  email: string;
  password: string;
};

@Injectable()
export class TesteService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(user: UserType) {
    return await this.prisma.user.create({
      data: user,
    });
  }

  async readAll() {
    return await this.prisma.user.findMany();
  }
}
