import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/infra/auth/guards/jwt-auth.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AdminUserService } from "../../services/admin-user.service";
import { AdminFindAllApiResponseDtoV1 } from "./dto/swagger/admin-find-all-api-response.dto";
import { PaginationDtoV1 } from "./dto/pagination.dto";

@Controller({ path: "admin/user", version: "1" })
@ApiTags("admin-user-v1")
export class AdminUserController {
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
