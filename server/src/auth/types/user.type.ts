import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TokenResponse } from '../../common/types/response.type';
import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
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
    description: 'JWT token for authenticated user',
    type: TokenResponse,
  })
  token: TokenResponse;
}

export class UserRequestDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 3,
    maxLength: 150,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'max.müller@agital.online',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the account (minimum 8 characters)',
    example: 'SecurePassword123',
    minLength: 8,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Birthdate of the user (optional)',
    example: '1990-01-01',
    required: false,
  })
  @IsString()
  @IsOptional()
  birthdate?: Date | null;
}

export class UserLoginRequestDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'max.müller@agital.online',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the account',
    example: 'SecurePassword123',
    minLength: 8,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
