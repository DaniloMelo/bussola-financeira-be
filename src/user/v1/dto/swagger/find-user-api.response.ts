import { ApiProperty } from "@nestjs/swagger";

class UserRolesRelation {
  @ApiProperty({
    description: "Role do usuário",
    example: "USER",
  })
  name: string;
}

export class FindMeWithRolesV1 {
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
    example: "2025-11-26T15:19:30.534Z",
    type: "string",
    format: "date-time",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Data da última atualização",
    example: "2025-11-26T15:19:30.534Z",
    type: "string",
    format: "date-time",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Dados da tabela relacionada 'user-credentials'",
    type: () => [UserRolesRelation],
  })
  roles: UserRolesRelation[];
}
