import { ApiProperty } from "@nestjs/swagger";

export class AuthApiResponseDto {
  @ApiProperty({
    description: "Acces token",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNGZlOGNmMy1lYjQwLTQyZmYtYmI0OC1jYzAxNzU5YmJkODciLCJpYXQiOjE3NjY5NTAwMDEsImV4cCI6MTc2NzU1NDgwMSwiYXVkIjoiYnVzc29sYS1maW5hbmNlaXJhLWRldiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSJ9.6QPgdDm9yTFn3CUDnh2diFC97XPjYo93uNJ5466X_xg",
  })
  access_token: string;
}
