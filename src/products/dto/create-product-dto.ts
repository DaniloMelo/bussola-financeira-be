import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateProductDto {
  @ApiProperty({
    description: "O nome do produto",
    example: "RTX 5090 Ultra Pro Max TI",
  })
  @IsString({ message: "O nome precisa conter caracteres válidos." })
  @IsNotEmpty({ message: "O nome não pode ser vazio." })
  name: string;
}
