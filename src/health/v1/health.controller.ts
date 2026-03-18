import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller({ path: "health", version: "1" })
@ApiTags("health-v1")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Health Checker para a API" })
  @ApiResponse({
    status: 200,
    description: "Retorna o estado da API",
    example: { status: "ok" },
  })
  healthCheck() {
    return { status: "ok" };
  }
}
