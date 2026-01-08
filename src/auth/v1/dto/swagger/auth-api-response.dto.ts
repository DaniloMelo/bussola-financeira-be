import { ApiProperty } from "@nestjs/swagger";

export class AuthApiResponseDto {
  @ApiProperty({
    description: "Access token",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNGZlOGNmMy1lYjQwLTQyZmYtYmI0OC1jYzAxNzU5YmJkODciLCJpYXQiOjE3NjY5NTAwMDEsImV4cCI6MTc2NzU1NDgwMSwiYXVkIjoiYnVzc29sYS1maW5hbmNlaXJhLWRldiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSJ9.6QPgdDm9yTFn3CUDnh2diFC97XPjYo93uNJ5466X_xg",
  })
  access_token: string;

  @ApiProperty({
    description: "Refresh token",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYTJhNDIzYy0yZTQ2LTRjNjgtYmJkMy00NzA5ZWU5N2Y2MzgiLCJpYXQiOjE3Njc3OTY1NTEsImV4cCI6MTc2ODQwMTM1MSwiYXVkIjoiYnVzc29sYS1maW5hbmNlaXJhLWRldiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSJ9.lsHOkCVI7BtKP7tYosn9GN6pVvzXhwIiYxBIsGPx9Yg",
  })
  refresh_token: string;
}
