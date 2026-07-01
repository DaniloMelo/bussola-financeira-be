import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsSafeString } from "src/common/validators/safe-string.validator";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { USER_CONSTANTS } from "../../../utils/constants/user.constant";

export class CreateUserDtoV1 {
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value as string;
  })
  @IsString({ message: "Nome precisa conter caracteres válidos." })
  @IsNotEmpty({ message: "Nome não pode ser espaços em branco." })
  @IsSafeString({ message: "Nome precisa conter caracteres válidos." })
  @MinLength(USER_CONSTANTS.NAME.MIN_LENGTH, {
    message: "Nome precisa ter o mínimo de 3 caracteres.",
  })
  @MaxLength(USER_CONSTANTS.NAME.MAX_LENGTH, {
    message: "Nome pode ter no máximo 100 caracteres.",
  })
  @ApiProperty({
    description: "Nome do usuário.",
    example: "John Doe",
  })
  name!: string;

  @IsEmail({}, { message: "E-mail inválido." })
  @ApiProperty({
    description: "E-mail do usuário.",
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
    description: "Senha do usuário",
    example: "password123",
  })
  password!: string;
}
