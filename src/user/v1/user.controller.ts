import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { UserService } from "../user.service";
import { CreateUserDtoV1 } from "./dto/create-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserResponseDtoV1 } from "./dto/create-user-response.dto";
import { FindAllUsersResponseDtoV1 } from "./dto/find-all-users.response.dto";
import { UpdateUserDtoV1 } from "./dto/update-user.dto";
import { ApiResponseDto } from "./dto/swagger/api-response.dto";

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
  @ApiOperation({ summary: "Retorna uma lista com todos os usuários" })
  @ApiResponse({
    status: 200,
    description: "Lista com usuários ou lista vazia caso não exista usuários",
    type: [FindAllUsersResponseDtoV1],
  })
  findAll() {
    return this.userService.findAll();
  }

  // TODO: Trocar route-params por Payload (JWT) na request
  @Patch(":id")
  @ApiOperation({ summary: "Atualiza um usuário" })
  @ApiResponse({
    status: 200,
    description: "Retorna o usuário atualizado",
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos, ausentes ou recurso não encontrado",
    example: new BadRequestException(["Mensagem de exemplo"]).getResponse(),
  })
  update(
    @Param("id") userId: string,
    @Body() updatedUserData: UpdateUserDtoV1,
  ) {
    return this.userService.update(userId, updatedUserData);
  }
}
