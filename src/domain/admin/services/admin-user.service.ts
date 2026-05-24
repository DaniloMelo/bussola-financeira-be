import { Injectable } from "@nestjs/common";
import { AdminUserRepository } from "../repositories/admin-user.repository";
import { PaginationDtoV1 } from "../controllers/v1/dto/pagination.dto";

@Injectable()
export class AdminUserService {
  constructor(private readonly adminUserRepository: AdminUserRepository) {}

  async findAll(pagination: PaginationDtoV1) {
    return await this.adminUserRepository.findAll(pagination);
  }
}
