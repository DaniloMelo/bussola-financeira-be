import {
  Body,
  Controller,
  Get,
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

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "Retorna a data do último email enviado.",
  })
  @ApiBearerAuth("access-token")
  @ApiResponse({
    status: 200,
    description:
      "Data do último email enviado e dias restantes para envio do novo",
    example: {
      last_email_date: "2026-11-18T22:35:46.441Z",
      days_remaining: 10,
    },
  })
  async findLastEmailSentDate() {
    return this.adminApplicationService.findLastSentEmailDate();
  }
}
