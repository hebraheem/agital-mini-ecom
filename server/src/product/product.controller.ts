import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UploadedFiles,
  UseInterceptors,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, ProductQueryDto, ProductResponseDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { multerConfig } from './config/multer.config';
import { PublicUrl } from '../common/decorators/public.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('top-rated')
  @PublicUrl()
  @ApiOperation({ summary: 'Get top-rated products' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Top-rated products retrieved successfully',
    type: [ProductResponseDto],
  })
  async getTopRatedProducts() {
    const query: ProductQueryDto = { toRated: true, limit: 10 };
    return this.productService.getProducts(query);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a new product with images' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateProductDto,
  ) {
    return this.productService.createProduct(body, files);
  }

  @Put(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async updateProduct(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, body, files);
  }

  @Get(':id')
  @PublicUrl()
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async getProduct(@Param('id') id: string) {
    return this.productService.getProduct(id);
  }

  @Get()
  @PublicUrl()
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiQuery({ name: 'inStock', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
  })
  async getProducts(@Query() query: ProductQueryDto) {
    return this.productService.getProducts(query);
  }

  @Delete(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
