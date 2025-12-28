import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateUserDtoV1 {
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
  @IsOptional()
  @ApiProperty({
    description: "Nome do usuário.",
    example: "John Doe Updated",
  })
  name?: string;

  @IsEmail({}, { message: "E-mail inválido." })
  @IsOptional()
  @ApiProperty({
    description: "E-mail do usuário.",
    example: "john_updated@email.com",
  })
  email?: string;

  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value as string;
  })
  @IsNotEmpty({ message: "Senha não pode ser espaços em branco." })
  @IsString({ message: "Senha precisa conter caracteres válidos." })
  @MinLength(6, { message: "Senha precisa ter o mínimo de 6 caracteres." })
  @IsOptional()
  @ApiProperty({
    description: "Senha do usuário",
    example: "updated_password123",
  })
  password?: string;
}
