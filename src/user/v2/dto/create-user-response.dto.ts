import { ApiProperty } from "@nestjs/swagger";
import { CreateUserCredentialsResponseDtoV2 } from "./create-user-credentials-response.dto";

export class CreateUserResponseDtoV2 {
  @ApiProperty({
    description: "ID do usuário (UUID).",
    example: "34eaa6f3-4ff8-4f70-8acb-44b70436891b",
  })
  id: string;

  @ApiProperty({
    description: "Nome do usuário.",
    example: "John Doe",
  })
  userName: string;

  @ApiProperty({
    description: "E-mail do usuário.",
    example: "John@email.com",
  })
  userEmail: string;

  @ApiProperty({
    description: "Data de criação do usuário",
    example: "2025-11-26T15:19:30.534Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Data da última atualização",
    example: "2025-11-26T15:19:30.534Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Dados da tabela relacionada 'user-credentials'",
    type: () => CreateUserCredentialsResponseDtoV2,
  })
  userCredentials: {
    id: string;
    lastLoginAt: Date | null;
  };
}
