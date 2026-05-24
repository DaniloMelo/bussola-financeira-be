import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller({ path: "/", version: "1" })
@ApiTags("app")
export class AppController {
  @Get("health")
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
