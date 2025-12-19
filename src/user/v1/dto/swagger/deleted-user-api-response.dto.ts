import { ApiProperty } from "@nestjs/swagger";

export class DeletedUserApiResponseDtoV1 {
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
    example: "2025-11-26T15:19:30.534Z",
  })
  deletedAt: Date | null;

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
    type: () => userCredentialsRelation,
  })
  userCredentials: {
    id: string;
    lastLoginAt: Date | null;
  };

  @ApiProperty({
    description: "Dados da tabela relacionada 'user-credentials'",
    type: () => [userRolesRelation],
  })
  roles: [
    {
      name: string;
    },
  ];
}

class userCredentialsRelation {
  @ApiProperty({
    description: "ID (UUID).",
    example: "4268a730-7109-4734-85c8-77e33e40118b",
  })
  id: string;

  @ApiProperty({
    description:
      "Data do último login realizado. Null para usuários recém criados.",
    nullable: true,
    example: null,
  })
  lastLoginAt: Date | null;
}

class userRolesRelation {
  @ApiProperty({
    description: "Role do usuário",
    example: "USER",
  })
  name: string;
}
