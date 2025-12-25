import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "../user.service";
import { CreateUserDtoV1 } from "./dto/create-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UpdateUserDtoV1 } from "./dto/update-user.dto";
import { UserApiResponseDtoV1 } from "./dto/swagger/user-api-response.dto";
import { DeletedUserApiResponseDtoV1 } from "./dto/swagger/deleted-user-api-response.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { IRequestUser } from "src/auth/interfaces/request-user";

@Controller({ path: "user", version: "1" })
@ApiTags("user-v1")
export class UserControllerV1 {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Cria um novo usuário." })
  @ApiResponse({
    status: 201,
    description: "Usuário criado.",
    type: UserApiResponseDtoV1,
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
    type: [UserApiResponseDtoV1],
  })
  findAll() {
    return this.userService.findAll();
  }

  // TODO: Trocar route-params por Payload (JWT) na request
  @Patch(":id")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Atualiza um usuário" })
  @ApiResponse({
    status: 200,
    description: "Retorna o usuário atualizado",
    type: UserApiResponseDtoV1,
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

  // TODO: Trocar route-params por Payload (JWT) na request
  @Delete(":id")
  @ApiOperation({ summary: "Exclui um usuário" })
  @ApiResponse({
    status: 200,
    description: "Retorna o usuário excluído (soft delete)",
    type: DeletedUserApiResponseDtoV1,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos, ausentes ou recurso não encontrado",
    example: new BadRequestException(["Mensagem de exemplo"]).getResponse(),
  })
  softDelete(@Param("id") userId: string) {
    return this.userService.softDelete(userId);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  tempFindOne(@Req() req: IRequestUser) {
    console.log(req.user);

    return this.userService.tempFindOne(req.user.id);
  }
}
