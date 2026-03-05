import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Image {
  @ApiProperty({
    description: 'URL of the product image',
    example: 'https://example.com/images/product123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Alternative text for the image',
    example: 'Front view of the product',
    required: false,
  })
  @IsString()
  @IsOptional()
  alt?: string | null;
}

export class Price {
  @ApiProperty({
    description: 'Reseller price for the product',
    example: 49.99,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  reseller: number;

  @ApiProperty({
    description: 'Recommended retail price for the product',
    example: 59.99,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  RRP: number;

  @ApiProperty({
    description: 'Discount amount for the product',
    example: 10.0,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  discount: number;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'Wireless Bluetooth Headphones',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Version of the product',
    example: '1.0.0',
    required: false,
  })
  @IsString()
  @IsOptional()
  version?: string | null;

  @ApiProperty({
    description: 'Short description of the product',
    example: 'A brief overview of the product features.',
    required: false,
  })
  @IsString()
  @IsOptional()
  shortDescription?: string | null;

  @ApiProperty({
    description: 'Detailed description of the product',
    example:
      'This is a comprehensive description of the product, highlighting its features and benefits.',
    required: false,
  })
  @IsString()
  @IsOptional()
  longDescription?: string | null;

  @ApiProperty({
    description: 'List of images (handled by multipart form upload)',
    required: false,
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsOptional()
  images?: any;

  @ApiProperty({
    description: 'Pricing details for the product (JSON string)',
    example: '{"reseller":49.99,"RRP":59.99,"discount":10.0}',
  })
  @IsString()
  @IsNotEmpty()
  price: string;

  @ApiProperty({
    description: 'Indicates if the product is currently in stock',
    example: 'true',
  })
  @IsNotEmpty()
  inStock: string;
}

export class ProductResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Wireless Bluetooth Headphones',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Version of the product',
    example: '1.0.0',
    required: false,
  })
  @IsString()
  @IsOptional()
  version?: string | null;

  @ApiProperty({
    description: 'Short description of the product',
    required: false,
  })
  @IsString()
  @IsOptional()
  shortDescription?: string | null;

  @ApiProperty({
    description: 'Detailed description of the product',
    required: false,
  })
  @IsString()
  @IsOptional()
  longDescription?: string | null;

  @ApiProperty({
    description: 'List of images',
    type: [Image],
  })
  images: Image[];

  @ApiProperty({
    description: 'Pricing details',
    type: Price,
  })
  price: Price;

  @ApiProperty({
    description: 'Stock status',
  })
  @IsBoolean()
  inStock: boolean;

  @ApiProperty({
    description: 'Timestamp when the product was created',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the product was last updated',
  })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Average rating of the product based on reviews',
    example: 4.5,
  })
  @Type(() => Number)
  averageRating?: number;

  @ApiProperty({
    description: 'Total number of reviews for the product',
    example: 10,
  })
  @Type(() => Number)
  reviewCount?: number;
}

export class ProductQueryDto {
  @ApiProperty({
    description: 'Filter products by stock status',
    required: false,
    example: 'true',
  })
  @IsOptional()
  inStock?: string;

  @ApiProperty({
    description: 'Search term to filter products by name or description',
    required: false,
    example: '',
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({
    description: 'Number of items per page for pagination',
    required: false,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({
    description: 'Field to sort by',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  toRated?: boolean;
}
