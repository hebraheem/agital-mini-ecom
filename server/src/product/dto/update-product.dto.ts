import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'Wireless Bluetooth Headphones',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

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
    description: 'Pricing details for the product (JSON string)',
    example: '{"reseller":49.99,"RRP":59.99,"discount":10.0}',
    required: false,
  })
  @IsString()
  @IsOptional()
  price?: string;

  @ApiProperty({
    description: 'Indicates if the product is currently in stock',
    example: 'true',
    required: false,
  })
  @IsString()
  @IsOptional()
  inStock?: string;

  @ApiProperty({
    description: 'Image URLs to keep (JSON array of URLs)',
    example: '["http://localhost:4000/uploads/image1.jpg"]',
    required: false,
  })
  @IsString()
  @IsOptional()
  keepImages?: string;
}
