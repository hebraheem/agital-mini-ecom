import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/types/user-response.type';

export type ResponseType<T> = {
  success: boolean;
  error: string | null;
  data: T | null;
};

export type ListResponseType<T> = {
  success: boolean;
  error: string | null;
  data: T[];
  meta: MetaType;
};

export class TokenResponse {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token (if available)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;
}

export class MetaType {
  @ApiProperty({
    description: 'Total number of items available',
    example: 100,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Number of items returned in the current page',
    example: 10,
  })
  itemCount: number;

  @ApiProperty({
    description: 'Number of items to be returned per page',
    example: 10,
  })
  itemsPerPage: number;

  @ApiProperty({
    description: 'Total number of pages available',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;
}
