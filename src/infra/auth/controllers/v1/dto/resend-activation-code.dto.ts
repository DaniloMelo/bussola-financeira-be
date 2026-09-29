import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ResendActivationCodeDtoV1 {
  @IsEmail({}, { message: "E-mail inválido." })
  @ApiProperty({
    description: "E-mail do usuário (extraído da URL)",
    example: "john@email.com",
  })
  email!: string;
}
