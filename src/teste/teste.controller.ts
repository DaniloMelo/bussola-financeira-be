import { Body, Controller, Get, Post } from "@nestjs/common";
import { TesteService, UserType } from "./teste.service";

@Controller("/user")
export class TesteController {
  constructor(private readonly testeService: TesteService) {}

  @Post()
  create(@Body() user: UserType) {
    return this.testeService.createUser(user);
  }

  @Get()
  read() {
    return this.testeService.readAll();
  }
}
