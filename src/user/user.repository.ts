import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDtoV1 } from "./v1/dto/create-user.dto";
import { IUpdateUserData } from "./interfaces/update";

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: CreateUserDtoV1) {
    return this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        userCredentials: {
          create: {
            passwordHash: userData.password,
            lastLoginAt: null,
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
    return await this.prisma.user.findMany({
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

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneById(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async update(userId: string, userData: IUpdateUserData) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: userData.name,
        email: userData.email,
        userCredentials: {
          update: {
            passwordHash: userData.password,
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
}
