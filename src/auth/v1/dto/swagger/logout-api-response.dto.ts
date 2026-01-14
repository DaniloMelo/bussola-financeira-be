import { ApiProperty } from "@nestjs/swagger";

class LogoutUserCredentialsRelation {
  @ApiProperty({
    description: "ID (UUID).",
    example: "4268a730-7109-4734-85c8-77e33e40118b",
  })
  id: string;

  @ApiProperty({
    description:
      "Data do último login realizado. Null para usuários recém criados.",
    nullable: true,
    type: "string",
    format: "date-time",
    example: "2026-01-13T16:10:12.361Z",
  })
  lastLoginAt: Date | null;

  @ApiProperty({
    description: "Valor nulo para o refresh token",
    nullable: true,
    example: null,
  })
  refreshTokenHash: string | null;
}

class LogoutUserRolesRelation {
  @ApiProperty({
    description: "Role do usuário",
    example: "USER",
  })
  name: string;
}

export class LogoutApiResponseDto {
  @ApiProperty({
    description: "ID do usuário (UUID).",
    example: "34eaa6f3-4ff8-4f70-8acb-44b70436891b",
  })
  id: string;

  @ApiProperty({
    description: "Nome do usuário.",
    example: "John Doe",
  })
  name: string;

  @ApiProperty({
    description: "E-mail do usuário.",
    example: "John@email.com",
  })
  email: string;

  @ApiProperty({
    description: "Data de exclusão do usuário.",
    nullable: true,
    type: "string",
    format: "date-time",
    example: null,
  })
  deletedAt: Date | null;

  @ApiProperty({
    description: "Data de criação do usuário",
    type: "string",
    format: "date-time",
    example: "2025-11-26T15:19:30.534Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Data da última atualização",
    type: "string",
    format: "date-time",
    example: "2025-11-26T15:19:30.534Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Dados da tabela relacionada 'user-credentials'",
    type: () => LogoutUserCredentialsRelation,
  })
  userCredentials: LogoutUserCredentialsRelation;

  @ApiProperty({
    description: "Dados da tabela relacionada 'user-credentials'",
    type: () => [LogoutUserRolesRelation],
  })
  roles: LogoutUserRolesRelation[];
}
