import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDtoV1 {
  @IsEmail({}, { message: "E-mail inválido." })
  @ApiProperty({
    description: "E-mail do usuário.",
    example: "john@email.com",
  })
  email: string;

  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value as string;
  })
  @IsNotEmpty({ message: "Senha não pode ser espaços em branco." })
  @IsString({ message: "Senha precisa conter caracteres válidos." })
  @MinLength(6, { message: "Senha precisa ter o mínimo de 6 caracteres." })
  @ApiProperty({
    description: "Senha do usuário",
    example: "password123",
  })
  password: string;
}
