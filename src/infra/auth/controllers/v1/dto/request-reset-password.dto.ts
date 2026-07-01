import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class RequestResetPasswordDtoV1 {
  @IsEmail({}, { message: "E-mail inválido." })
  @ApiProperty({
    description: "E-mail do usuário.",
    example: "john@email.com",
  })
  email!: string;
}
