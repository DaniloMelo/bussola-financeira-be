import { Body, Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AdminApplicationService } from "src/domain/admin/application/services/admin-application.service";
import { JwtAuthGuard } from "src/infra/auth/guards/jwt-auth.guard";
import { UpstashCountDtov1 } from "./dto/upstash-count.dto";

@Controller({ path: "admin/application", version: "1" })
@ApiTags("admin-application-v1")
export class AdminApplicationController {
  constructor(
    private readonly adminApplicationService: AdminApplicationService,
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth("access-token")
  updateUpstashDateCount(@Body() data: UpstashCountDtov1) {
    return this.adminApplicationService.updateUpstashDateCount(data);
  }
}
