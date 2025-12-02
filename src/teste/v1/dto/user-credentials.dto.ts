import { ApiProperty } from "@nestjs/swagger";

export class UserCredentialsDto {
  @ApiProperty({
    description: "ID (UUID)",
    example: "34eaa6f3-4ff8-4f70-8acb-44b7036891b",
  })
  id: string;

  @ApiProperty({
    description:
      "Data do ultimo login realizado. Null para usuários recém criados",
    example: null,
  })
  lastLoginAt: Date | null;
}
