import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class CreateUserDtoV1 {
  @ApiProperty({
    description: "O nome do usuário",
    example: "John Doe",
  })
  @IsString({ message: "O nome precisa conter caracteres válidos." })
  @IsNotEmpty({ message: "O nome não pode ser vazio." })
  name: string;

  @ApiProperty({
    description: "O email do usuário",
    example: "John@email.com",
  })
  @IsEmail({}, { message: "O e-mail deve ser um endereço válido." })
  @IsNotEmpty({ message: "O e-mail não pode ser vazio." })
  email: string;

  @ApiProperty({
    description: "A senha do usuário",
    example: "123456",
  })
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres." })
  password: string;
}
