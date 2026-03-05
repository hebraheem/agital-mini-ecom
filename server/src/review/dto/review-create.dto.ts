import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MetaType } from '../../common/types/response.type';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID of the product being reviewed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Rating given by the user (e.g., 1-5)',
    example: 4,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Text content of the review',
    example: 'Great product! Highly recommend.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class ReviewResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the review',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'ID of the product being reviewed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'ID of the user who submitted the review',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Rating given by the user (e.g., 1-5)',
    example: 4,
  })
  @IsNumber()
  rating: number;

  @ApiProperty({
    description: 'Text content of the review',
    example: 'Great product! Highly recommend.',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Timestamp when the review was created',
    example: '2024-06-01T12:34:56Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the review was last updated',
    example: '2024-06-02T12:34:56Z',
  })
  updatedAt: Date;
}

export class ReviewParamDto {
  @ApiProperty({
    description: 'Filter reviews by product ID',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;
}

export class ReviewParamProDto {
  @ApiProperty({
    description: 'Filter reviews by product ID',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  productId: string;
}

export class ReviewQueryDto {
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
    description: 'Sort reviews by creation date (asc or desc)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Min(5)
  @Type(() => Number)
  rating?: number;
}

export class ReviewListResponseDto {
  @ApiProperty({
    description: 'List of reviews for the specified product',
    type: [ReviewResponseDto],
  })
  data: ReviewResponseDto[];

  @ApiProperty({
    description: 'Indicates whether the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message if the request failed',
    example: null,
  })
  error: string | null;

  @ApiProperty({
    description: 'Pagination and metadata information',
    type: MetaType,
  })
  meta: MetaType;
}
