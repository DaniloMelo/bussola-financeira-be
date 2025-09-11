import { Body, Controller, Post } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product-dto";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: "Cria um novo produto." })
  @ApiBody({
    type: CreateProductDto,
    description: "Dados para criar um novo produto.",
  })
  @ApiResponse({ status: 201, description: "Produto foi criado com sucesso." })
  @ApiResponse({ status: 400, description: "Dados inválidos." })
  create(@Body() product: CreateProductDto) {
    return this.productsService.create(product);
  }
}
