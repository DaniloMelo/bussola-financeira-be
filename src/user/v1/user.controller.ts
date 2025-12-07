import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from "@nestjs/common";
import { UserService } from "../user.service";
import { CreateUserDtoV1 } from "./dto/create-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserResponseDtoV1 } from "./dto/create-user-response.dto";

@Controller({ path: "user", version: "1" })
@ApiTags("user-v1")
export class UserControllerV1 {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Cria um novo usuário." })
  @ApiResponse({
    status: 201,
    description: "Usuário criado.",
    type: CreateUserResponseDtoV1,
  })
  @ApiResponse({
    status: 400,
    description:
      "Falha na validação dos dados de entrada (ex: campo ausente, formato inválido, ou e-mail já em uso).",
    example: new BadRequestException([
      "Falha ao criar o usuário. Verifique os dados fornecidos.",
    ]).getResponse(),
  })
  create(@Body() userInputData: CreateUserDtoV1) {
    return this.userService.create(userInputData);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
