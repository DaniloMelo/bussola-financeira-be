import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class UpstashCountDtov1 {
  @IsNotEmpty({ message: "Senha não pode ser espaços em branco." })
  @IsString({ message: "Senha precisa conter caracteres válidos." })
  @MinLength(1, {
    message: "Senha precisa ter o mínimo de 6 caracteres.",
  })
  @ApiProperty({
    description: "Data do envio de email para resetar o contador upstash",
    example: "2026-11-18T22:35:46.441Z",
  })
  date!: string;
}
