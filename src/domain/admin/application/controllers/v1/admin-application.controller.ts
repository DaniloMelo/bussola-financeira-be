import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
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

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Envia email simples para reiniciar o contador da Upstash.",
  })
  @ApiBearerAuth("access-token")
  @ApiResponse({
    status: 200,
    description: "Email enviado com sucesso.",
    example: {
      message: "Email enviado, contador atualizado.",
    },
  })
  updateUpstashDateCount(@Body() data: UpstashCountDtov1) {
    return this.adminApplicationService.updateUpstashDateCount(data);
  }
}
