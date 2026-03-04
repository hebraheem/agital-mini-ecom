import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { MetaType } from '../../common/types/response.type';
import { Type } from 'class-transformer';

export class UserDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'max.müller@agital.online',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Date and time when the user was created',
    example: '2024-01-01T12:00:00Z',
  })
  @IsString()
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the user was last updated',
    example: '2024-01-02T12:00:00Z',
  })
  @IsString()
  updatedAt: Date;

  @ApiProperty({
    description: 'Birthdate of the user (optional)',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  birthdate?: Date | null;

  @ApiProperty({
    description: 'Total number of reviews associated with the user (optional)',
    example: 5,
    required: false,
  })
  totalReviews?: number;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User data',
    type: UserDto,
  })
  data: UserDto;

  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message if the operation failed',
    example: null,
    required: false,
  })
  error: string | null;

  @ApiProperty({
    description: 'Pagination metadata (if applicable)',
    required: false,
    type: MetaType,
  })
  meta?: MetaType;
}

export class UserQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  page?: number;
}
