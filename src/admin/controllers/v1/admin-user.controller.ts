import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RolesGuard } from "src/common/guards/roles.guard";
import { PaginationDtoV1 } from "./dto/pagination.dto";
import { AdminUserService } from "src/admin/services/admin-user.service";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth("access-token")
  findAll(@Query() pagination: PaginationDtoV1) {
    return this.adminUserService.findAll(pagination);
  }
}
