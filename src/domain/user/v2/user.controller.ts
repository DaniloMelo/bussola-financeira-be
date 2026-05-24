import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { UserService } from "../user.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDtoV2 } from "./dto/create-user.dto";
import { CreateUserResponseDtoV2 } from "./dto/create-user-response.dto";

@Controller({ path: "user", version: "2" })
@ApiTags("user-v2")
export class UserControllerV2 {
  constructor(private readonly userService: UserService) {}

  // TODO: finalizar a criação do controller v2 no final do projeto.
  @Post()
  @ApiOperation({ summary: "Cria um novo usuário." })
  @ApiResponse({
    status: 201,
    description: "Usuário criado.",
    type: CreateUserResponseDtoV2,
  })
  @ApiResponse({
    status: 400,
    description:
      "Falha na validação dos dados de entrada (ex: campo ausente, formato inválido, ou e-mail já em uso).",
    example: new BadRequestException([
      "Falha ao criar o usuário. Verifique os dados fornecidos.",
    ]).getResponse(),
  })
  async create(@Body() userInputData: CreateUserDtoV2) {
    const response = await this.userService.create({
      name: userInputData.userName,
      email: userInputData.userEmail,
      password: userInputData.userPassword,
    });

    return {
      id: response.id,
      userName: response.name,
      userEmail: response.email,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      userCredentials: {
        id: response.userCredentials?.id,
        lastLoginAt: response.userCredentials?.lastLoginAt,
      },
    };
  }
}
