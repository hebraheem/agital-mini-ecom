import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUserResponseDto, UserRequestDto } from './types/user.type';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import { ResponseType, TokenResponse } from '../common/types/response.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new user by hashing the password and saving the user data to the database.
   * @param data - The user registration data containing name, email, and password.
   * @returns A promise that resolves to the registered user's data without the password.
   * @throws An error if the registration process fails (e.g., email already exists).
   * */
  async register(data: UserRequestDto): Promise<ResponseType<AuthUserResponseDto>> {
    data.email = data.email.toLowerCase();
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    if (data.birthdate) data.birthdate = new Date(data.birthdate);
    const hashPassword = await this.hashPassword(data.password);
    const user = this.prismaService.user.create({ data: { ...data, password: hashPassword } });
    const { password, ...userWithoutPassword } = await user;
    const tokens = this.generateTokens(
      userWithoutPassword.id,
      userWithoutPassword.name,
      userWithoutPassword.email,
    );
    return { data: { ...userWithoutPassword, token: tokens }, success: true, error: null };
  }

  /**
   * Login user by validating the email and password, and generating JWT tokens upon successful authentication.
   * @param email - The email of the user trying to log in.
   * @param password - The password of the user trying to log in.
   * @returns A promise that resolves to an object containing access and refresh tokens if authentication is successful.
   * @throws An error if the user is not found or if the credentials are invalid.
   * */
  async login(email: string, password: string): Promise<ResponseType<TokenResponse>> {
    const user = await this.prismaService.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException('User with this email does exists');
    }
    const isPasswordValid = await this.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    const tokens = this.generateTokens(user.id, user.name, user.email);
    return { success: true, data: tokens, error: null };
  }

  private async hashPassword(password: string): Promise<string> {
    const rounds: number = parseInt(this.configService.get('auth.bcryptRounds') ?? '10', 10);
    return bcrypt.hash(password, rounds);
  }

  private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private generateTokens(userId: string, name: string, email: string): TokenResponse {
    const payload: JwtPayload = { sub: userId, name, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('auth.jwtSecret'),
      expiresIn: this.configService.get('auth.jwtExpiresIn'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('auth.jwtRefreshSecret'),
      expiresIn: this.configService.get('auth.jwtRefreshExpiresIn'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
