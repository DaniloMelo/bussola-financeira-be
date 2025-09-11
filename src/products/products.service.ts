import { Injectable } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product-dto";

@Injectable()
export class ProductsService {
  create(product: CreateProductDto) {
    console.log(product);
  }
}
