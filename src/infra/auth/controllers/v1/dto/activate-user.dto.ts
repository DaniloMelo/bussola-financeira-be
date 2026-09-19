import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ActivateUserDtoV1 {
  @IsString({ message: "Código precisa conter caracteres válidos." })
  @IsNotEmpty({ message: "Código não pode ser espaços em branco." })
  @ApiProperty({
    description: "Código para ativação do usuário",
    example: "123456",
  })
  rawCode!: string;

  @IsEmail({}, { message: "E-mail inválido." })
  @ApiProperty({
    description: "E-mail do usuário (extraído da URL)",
    example: "john@email.com",
  })
  email!: string;
}
