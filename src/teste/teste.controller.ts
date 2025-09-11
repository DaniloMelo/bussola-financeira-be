import { Body, Controller, Get, Post } from "@nestjs/common";
import { TesteService } from "./teste.service";
import { CreateUserDto } from "./dto/create-user-dto";

@Controller("/user")
export class TesteController {
  constructor(private readonly testeService: TesteService) {}

  @Post()
  create(@Body() user: CreateUserDto) {
    return this.testeService.createUser(user);
  }

  @Get()
  read() {
    return this.testeService.readAll();
  }
}
