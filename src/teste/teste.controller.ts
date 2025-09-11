import { Body, Controller, Get, Post } from "@nestjs/common";
import { TesteService } from "./teste.service";
import { CreateUserDto } from "./dto/create-user-dto";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("users")
@Controller("/user")
export class TesteController {
  constructor(private readonly testeService: TesteService) {}

  @Post()
  @ApiOperation({ summary: "Cria um novo usuário." })
  @ApiBody({
    type: CreateUserDto,
    description: "Dados para criar um novo usuário.",
  })
  @ApiResponse({ status: 201, description: "Usuário foi criado com sucesso." })
  @ApiResponse({ status: 400, description: "Dados inválidos." })
  create(@Body() user: CreateUserDto) {
    return this.testeService.createUser(user);
  }

  @Get()
  @ApiOperation({ summary: "Retorna todos os usuários" })
  @ApiResponse({
    status: 200,
    description: "Lista de usuários retornada com sucesso.",
  })
  read() {
    return this.testeService.readAll();
  }
}
