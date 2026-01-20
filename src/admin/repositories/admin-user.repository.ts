import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PaginationDtoV1 } from "../controllers/v1/dto/pagination.dto";

@Injectable()
export class AdminUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDtoV1) {
    return await this.prisma.user.findMany({
      take: pagination.limit,
      skip: pagination.offset,
      include: {
        userCredentials: {
          select: {
            lastLoginAt: true,
          },
        },
        roles: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
