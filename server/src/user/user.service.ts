import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto, UserQueryDto, UserResponseDto } from './types/user-response.type';
import { UserUpdateRequestDto } from '../auth/types/user.type';
import { ListResponseType, ResponseType } from '../common/types/response.type';
import { PaginateQuery } from '../common/classes/paginate-query';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fetches a user by their unique identifier (ID) from the database. If the user is found, it returns the user's data without the password. If the user is not found, it throws a NotFoundException.
   * @param id - The unique identifier of the user to be fetched.
   * @returns A promise that resolves to a UserResponseDto containing the user's data (excluding the password) if found, or throws an error if not found.
   * @throws NotFoundException if the user with the specified ID does not exist in the database.
   * */
  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const { password, ...userWithoutPassword } = user;

    return { data: userWithoutPassword, error: null, success: true };
  }

  /**
   * Updates a user's information in the database based on the provided user ID and update data. It first checks if the user exists, and if not, it throws a NotFoundException. If the user exists, it updates the user's information with the provided data (after converting birthdate to a Date object if it's included) and returns the updated user data without the password.
   * @param id - The unique identifier of the user to be updated.
   * @param updateData - An object containing the fields to be updated for the user. This can include any subset of the user's properties, such as name, email, or birthdate.
   * @returns A promise that resolves to a UserResponseDto containing the updated user's data (excluding the password) if the update is successful, or throws an error if the user is not found.
   * @throws NotFoundException if the user with the specified ID does not exist in the database.
   * */
  async updateUser(
    id: string,
    updateData: Partial<UserUpdateRequestDto>,
  ): Promise<UserResponseDto> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (updateData.birthdate) updateData.birthdate = new Date(updateData.birthdate);
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: updateData,
    });
    const { password, ...userWithoutPassword } = updatedUser;
    return { data: userWithoutPassword, error: null, success: true };
  }

  /**
   * Deletes a user from the database based on the provided user ID. It first checks if the user exists, and if not, it throws a NotFoundException. If the user exists, it deletes the user from the database and returns a response indicating that the operation was successful with no data.
   * @param id - The unique identifier of the user to be deleted.
   * @returns A promise that resolves to a ResponseType with null data and success set to true if the deletion is successful, or throws an error if the user is not found.
   * @throws NotFoundException if the user with the specified ID does not exist in the database.
   * */
  async deleteUser(id: string): Promise<ResponseType<null>> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.prismaService.user.delete({ where: { id } });
    return { data: null, success: true, error: null };
  }

  /**
   * Gets a paginated list of users from the database based on the provided query parameters and the ID of the requesting user. It allows for searching users by name or email while excluding the requesting user from the results. The method calculates pagination metadata and returns a list of users along with pagination details.
   * @param query - An object containing query parameters for searching and pagination, including search term, limit, and page number.
   * @param userId - The unique identifier of the requesting user, which is used to exclude them from the search results.
   * @returns A promise that resolves to a ListResponseType containing an array of UserResponseDto objects (excluding the requesting user) along with pagination metadata such as total items, item count, items per page, total pages, and current page.
   * */
  async getAllUsers(query: UserQueryDto, userId: string): Promise<ListResponseType<UserDto>> {
    const { search, limit, page } = query;
    const where = { id: { not: userId } };
    if (search) {
      // @ts-ignore
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (!limit) {
      query.limit = 10;
    }
    if (!page) {
      query.page = 1;
    }
    const include = {
      _count: {
        select: { reviews: true },
      },
    };
    const paginateQuery = new PaginateQuery(
      // @ts-ignore
      this.prismaService.user,
      query.page!,
      query.limit!,
      where,
      include,
      mapToUserResponseDto,
    );
    return paginateQuery.paginate();
  }

  /**
   * Updates a user's password in the database based on the provided user ID and new password. It first checks if the user exists, and if not, it throws a NotFoundException. If the user exists, it updates the user's password with the new value and returns a response indicating that the operation was successful with no data.
   * @param id - The unique identifier of the user whose password is to be updated.
   * @param newPassword - The new password to be set for the user.
   * @returns A promise that resolves to a ResponseType with null data and success set to true if the password update is successful, or throws an error if the user is not found.
   * @throws NotFoundException if the user with the specified ID does not exist in the database.
   * */
  async updatePassword(id: string, newPassword: string): Promise<ResponseType<null>> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.prismaService.user.update({
      where: { id },
      data: { password: await this.hashPassword(newPassword) },
    });
    return { data: null, success: true, error: null };
  }

  private async hashPassword(password: string): Promise<string> {
    const rounds: number = parseInt(this.configService.get('auth.bcryptRounds') ?? '10', 10);
    return bcrypt.hash(password, rounds);
  }
}

const mapToUserResponseDto = (
  users: ({
    _count: {
      reviews: number;
    };
  } & UserDto)[],
): UserDto[] => {
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    birthdate: user.birthdate,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    totalReviews: user._count.reviews,
  }));
};
