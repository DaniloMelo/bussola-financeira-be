import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { USER_CONSTANTS } from "src/domain/user/utils/constants/user.constant";

export class ResetPasswordDtoV1 {
  @IsString({ message: "Token precisa conter caracteres válidos." })
  @IsNotEmpty({ message: "Token não pode ser espaços em branco." })
  @ApiProperty({
    description: "Token para reset de senha (extraído da URL)",
    example: "token-unico-aleatorio-123",
  })
  tokenRaw!: string;

  @IsEmail({}, { message: "E-mail inválido." })
  @ApiProperty({
    description: "E-mail do usuário (extraído da URL)",
    example: "john@email.com",
  })
  email!: string;

  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value as string;
  })
  @IsNotEmpty({ message: "Senha não pode ser espaços em branco." })
  @IsString({ message: "Senha precisa conter caracteres válidos." })
  @MinLength(USER_CONSTANTS.PASSWORD.MIN_LENGTH, {
    message: "Senha precisa ter o mínimo de 6 caracteres.",
  })
  @ApiProperty({
    description: "Nova senha do usuário",
    example: "resetedpassword123",
  })
  password!: string;
}
