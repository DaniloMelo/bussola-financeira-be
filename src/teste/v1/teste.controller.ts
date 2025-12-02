import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from "@nestjs/common";
import { TesteService } from "../teste.service";
import { CreateUserDtoV1 } from "../v1/dto/create-user-dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserResponseDtoV1 } from "./dto/create-user-response-dto";

@Controller({ path: "teste", version: "1" })
@ApiTags("teste-v1")
export class TesteController {
  constructor(private readonly testeService: TesteService) {}

  @Post()
  @ApiOperation({ summary: "Cria um novo usuário." })
  @ApiResponse({
    status: 201,
    description: "Usuário foi criado com sucesso.",
    type: CreateUserResponseDtoV1,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos",
    example: new BadRequestException("Mensagem de erro").getResponse(),
  })
  create(@Body() user: CreateUserDtoV1) {
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
