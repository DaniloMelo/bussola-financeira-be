import { Body, Controller, Get, Post } from "@nestjs/common";
import { TesteService } from "./teste.service";
import { CreateUserDto } from "./dto/create-user-dto";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

// Agrupa todos os endpoints deste controlador sob a tag 'users'
@ApiTags("users")
@Controller("/user")
export class TesteController {
  constructor(private readonly testeService: TesteService) {}

  @Post()
  // Descreve o que este endpoint faz
  @ApiOperation({ summary: "Cria um novo usuário." })
  // Define o corpo da requisição
  @ApiBody({
    type: CreateUserDto,
    description: "Dados para criar um novo usuário.",
  })
  // Resposta de sucesso
  @ApiResponse({ status: 201, description: "Usuário foi criado com sucesso." })
  // Resposta de erro
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
