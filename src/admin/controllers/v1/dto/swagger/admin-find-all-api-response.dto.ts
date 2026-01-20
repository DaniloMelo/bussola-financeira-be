import { ApiProperty } from "@nestjs/swagger";

class AdminFindAllUserCredentialsRelation {
  lastLoginAt: Date;
}

class AdminFindAllRolesRelation {
  name: string;
}

export class AdminFindAllApiResponseDtoV1 {
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
    example: "john@email.com",
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
    type: () => AdminFindAllUserCredentialsRelation,
  })
  userCredentials: {
    lastLoginAt: AdminFindAllUserCredentialsRelation;
  };

  @ApiProperty({
    description: "Dados da tabela relacionada 'user-credentials'",
    type: () => [AdminFindAllRolesRelation],
  })
  roles: AdminFindAllRolesRelation[];
}
