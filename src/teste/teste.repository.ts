import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserParams } from "./interfaces/user.interface";

@Injectable()
export class TesteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: CreateUserParams) {
    const { name, email, password } = userData;

    return this.prisma.user.create({
      data: {
        name,
        email,
        userCredentials: {
          create: {
            passwordHash: password,
          },
        },
      },
      include: {
        userCredentials: {
          select: {
            id: true,
            lastLoginAt: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        userCredentials: {
          select: {
            id: true,
            lastLoginAt: true,
          },
        },
      },
    });
  }
}
