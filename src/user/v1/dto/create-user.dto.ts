import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDtoV1 {
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value as string;
  })
  @IsNotEmpty({ message: "Nome não pode ser espaços em branco." })
  @IsString({ message: "Nome precisa conter caracteres válidos." })
  @MinLength(3, { message: "Nome precisa ter o mínimo de 3 caracteres." })
  @MaxLength(100, { message: "Nome pode ter no máximo 100 caracteres." })
  @ApiProperty({
    description: "Nome do usuário.",
    example: "John Doe",
  })
  name: string;

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
    example: "pass123",
  })
  password: string;
}
