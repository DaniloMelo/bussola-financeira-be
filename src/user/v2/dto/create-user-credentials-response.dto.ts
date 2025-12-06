import { ApiProperty } from "@nestjs/swagger";

export class CreateUserCredentialsResponseDtoV2 {
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
