import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RolesGuard } from "src/common/guards/roles.guard";
import { PaginationDtoV1 } from "./dto/pagination.dto";
import { AdminUserService } from "src/admin/services/admin-user.service";
import { AdminFindAllApiResponseDtoV1 } from "./dto/swagger/admin-find-all-api-response.dto";

@Controller({ path: "admin", version: "1" })
@ApiTags("admin-v1")
export class AdminController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Lista todos os usuários" })
  @ApiBearerAuth("access-token")
  @ApiResponse({
    status: 200,
    description: "Retorna a lista de usuários",
    type: AdminFindAllApiResponseDtoV1,
  })
  findAll(@Query() pagination: PaginationDtoV1) {
    return this.adminUserService.findAll(pagination);
  }
}
