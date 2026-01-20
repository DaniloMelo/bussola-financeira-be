import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt } from "class-validator";

export class PaginationDtoV1 {
  @Type(() => Number)
  @IsInt()
  @ApiProperty({
    description: "Quantidade de itens por página",
    example: 10,
  })
  limit: number;

  @Type(() => Number)
  @IsInt()
  @ApiProperty({
    description: "Quantida de items pulados",
    example: 0,
  })
  offset: number;
}
