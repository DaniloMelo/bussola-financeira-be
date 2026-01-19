import { Type } from "class-transformer";
import { IsInt } from "class-validator";

export class PaginationDtoV1 {
  @Type(() => Number)
  @IsInt()
  limit: number;

  @Type(() => Number)
  @IsInt()
  offset: number;
}
