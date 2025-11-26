import { ApiProperty } from "@nestjs/swagger";

export class CreateUserResponseDtoV2 {
  @ApiProperty({
    description: "ID (UUID) do usuário",
    example: "34eaa6f3-4ff8-4f70-8acb-44b70436891b",
  })
  id: string;

  @ApiProperty({
    description: "Nome do usuário",
    example: "John Doe",
  })
  userName: string;

  @ApiProperty({
    description: "E-mail do usuário",
    example: "john@email.com",
  })
  userEmail: string;

  @ApiProperty({
    description: "Hash de senha do usuaário",
    example: "asodiaosidnaos",
  })
  password: string;

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
}
