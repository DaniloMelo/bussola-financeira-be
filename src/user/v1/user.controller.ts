import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { UserService } from "../user.service";
import { CreateUserDtoV1 } from "./dto/create-user.dto";
import { DeletedUserApiResponseDtoV1 } from "./dto/swagger/deleted-user-api-response.dto";
import { UpdateUserApiResponseDtoV1 } from "./dto/swagger/update-user-api-response.dto";
import { UserApiResponseDtoV1 } from "./dto/swagger/user-api-response.dto";
import { UpdateUserDtoV1 } from "./dto/update-user.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

@Controller({ path: "user", version: "1" })
@ApiTags("user-v1")
export class UserControllerV1 {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Cria um novo usuário" })
  @ApiResponse({
    status: 201,
    description: "Retorna o usuário criado",
    type: UserApiResponseDtoV1,
  })
  @ApiResponse({
    status: 400,
    description:
      "Falha na validação dos dados de entrada (ex: campo ausente, formato inválido, ou e-mail já em uso)",
    example: new BadRequestException([
      "Falha ao criar o usuário. Verifique os dados fornecidos",
    ]).getResponse(),
  })
  create(@Body() userInputData: CreateUserDtoV1) {
    return this.userService.create(userInputData);
  }

  @Get()
  @ApiOperation({ summary: "Lista todos os usuários" })
  @ApiResponse({
    status: 200,
    description:
      "Retorna uma lista com todo os usuários ou uma lista vazia caso não exista usuários",
    type: [UserApiResponseDtoV1],
  })
  findAll() {
    return this.userService.findAll();
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Atualiza um usuário" })
  @ApiBearerAuth("access-token")
  @ApiHeader({
    name: "Authorization",
    description: "Bearer <access_token>",
  })
  @ApiResponse({
    status: 200,
    description: "Retorna o usuário atualizado",
    type: UpdateUserApiResponseDtoV1,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos, ausentes ou recurso não encontrado",
    example: new BadRequestException(["Mensagem de exemplo"]).getResponse(),
  })
  update(
    @CurrentUser("id") userId: string,
    @Body() updatedUserData: UpdateUserDtoV1,
  ) {
    return this.userService.update(userId, updatedUserData);
  }

  @Delete("me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Exclui um usuário" })
  @ApiBearerAuth("access-token")
  @ApiHeader({
    name: "Authorization",
    description: "Bearer <access_token>",
  })
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
  softDelete(@CurrentUser("id") userId: string) {
    return this.userService.softDelete(userId);
  }
}
