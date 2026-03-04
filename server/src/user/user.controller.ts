import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserQueryDto, UserResponseDto } from './types/user-response.type';
import { UserUpdateRequestDto } from '../auth/types/user.type';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiQuery({
    description: 'Name of the user to search for (optional)',
    example: 'John Doe',
    required: false,
    name: 'search',
  })
  @ApiQuery({
    description: 'Pagination limit for the number of users to return (optional)',
    example: 10,
    required: false,
    name: 'limit',
  })
  @ApiQuery({
    description: 'Pagination offset for the number of users to skip (optional)',
    example: 1,
    required: false,
    name: 'page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: UserResponseDto,
  })
  async findAll(@Query() queryParam: UserQueryDto, @CurrentUser('sub') userId: string) {
    return this.userService.getAllUsers(queryParam, userId);
  }

  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async currentUser(@CurrentUser('sub') userId: string) {
    return this.userService.findById(userId);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user to retrieve',
    example: '69a88bc6740203f83ea4909c',
    required: true,
  })
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch()
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiBody({
    description: 'Data to update the current user',
    type: UserUpdateRequestDto,
  })
  async updateUser(
    @Body() updateUserDto: Partial<UserUpdateRequestDto>,
    @CurrentUser('sub') userId: string,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete()
  @ApiResponse({
    status: 200,
    description: 'Current user deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async deleteUser(@CurrentUser('sub') userId: string) {
    return this.userService.deleteUser(userId);
  }

  @Patch('password')
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiBody({
    description: 'New password for the current user',
    schema: {
      type: 'object',
      properties: {
        newPassword: {
          type: 'string',
          example: 'newSecurePassword123!',
        },
      },
      required: ['newPassword'],
    },
  })
  async updatePassword(
    @CurrentUser('sub') userId: string,
    @Body() newPassword: { newPassword: string },
  ) {
    return this.userService.updatePassword(userId, newPassword.newPassword);
  }
}
