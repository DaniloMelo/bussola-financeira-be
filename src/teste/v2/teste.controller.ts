import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from "@nestjs/common";
import { TesteService } from "../teste.service";
import { CreateUserDtoV2 } from "../v2/dto/create-user-dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserResponseDtoV2 } from "./dto/create-user-response-dto";

@Controller({ path: "teste", version: "2" })
@ApiTags("teste-v2")
export class TesteController {
  constructor(private readonly testeService: TesteService) {}

  @Post()
  @ApiOperation({ summary: "Cria um novo usuário." })
  @ApiResponse({
    status: 201,
    description: "Usuário foi criado com sucesso.",
    type: CreateUserResponseDtoV2,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos",
    example: new BadRequestException("Mensagem de erro").getResponse(),
  })
  async create(@Body() user: CreateUserDtoV2) {
    const res = await this.testeService.createUser({
      name: user.userName,
      email: user.userEmail,
      password: user.password,
    });

    return {
      id: res.id,
      userName: res.name,
      userEmail: res.email,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
      userCredentials: {
        id: res.userCredentials?.id,
        lastLoginAt: null,
      },
    };
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
