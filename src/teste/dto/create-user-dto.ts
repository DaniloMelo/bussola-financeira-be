import { IsString, IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString({ message: "O nome precisa conter caracteres válidos." })
  @IsNotEmpty({ message: "O nome não pode ser vazio." })
  name: string;

  @IsEmail({}, { message: "O e-mail deve ser um endereço válido." })
  @IsNotEmpty({ message: "O e-mail não pode ser vazio." })
  email: string;

  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres." })
  password: string;
}
