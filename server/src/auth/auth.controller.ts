import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUserResponseDto, UserLoginRequestDto, UserRequestDto } from './types/user.type';
import { ResponseType, TokenResponse } from '../common/types/response.type';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicUrl } from '../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicUrl()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with email and password. Returns JWT token.',
  })
  @ApiBody({
    type: UserRequestDto,
    description: 'User registration credentials',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or user already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async signup(@Body() data: UserRequestDto): Promise<ResponseType<AuthUserResponseDto>> {
    return this.authService.register(data);
  }

  @PublicUrl()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user with credentials and return JWT token.',
  })
  @ApiBody({
    type: UserLoginRequestDto,
    description: 'Login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
    type: TokenResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async login(@Body() data: UserLoginRequestDto): Promise<ResponseType<TokenResponse>> {
    return this.authService.login(data.email, data.password);
  }
}
