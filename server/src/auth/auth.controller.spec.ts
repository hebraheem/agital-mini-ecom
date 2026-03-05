import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRequestDto, UserLoginRequestDto } from './types/user.type';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    const validSignupDto: UserRequestDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
      birthdate: null,
    };

    const mockRegistrationResponse = {
      success: true,
      error: null,
      data: {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        birthdate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        token: {
          accessToken: 'mock.access.token',
          refreshToken: 'mock.refresh.token',
        },
      },
    };

    it('should successfully register a new user', async () => {
      mockAuthService.register.mockResolvedValue(mockRegistrationResponse);

      const result = await controller.signup(validSignupDto);

      expect(result).toEqual(mockRegistrationResponse);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.token).toBeDefined();
      expect(authService.register).toHaveBeenCalledWith(validSignupDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when user already exists', async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(controller.signup(validSignupDto)).rejects.toThrow(ConflictException);
      await expect(controller.signup(validSignupDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });

    it('should propagate service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockAuthService.register.mockRejectedValue(serviceError);

      await expect(controller.signup(validSignupDto)).rejects.toThrow('Database connection failed');
    });
  });

  describe('login', () => {
    const validLoginDto: UserLoginRequestDto = {
      email: 'test@example.com',
      password: 'Password123',
    };

    const mockLoginResponse = {
      success: true,
      error: null,
      data: {
        accessToken: 'mock.access.token',
        refreshToken: 'mock.refresh.token',
      },
    };

    it('should successfully login with valid credentials', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(validLoginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(result.success).toBe(true);
      expect(result.data!.accessToken).toBeDefined();
      expect(result.data!.refreshToken).toBeDefined();
      expect(authService.login).toHaveBeenCalledWith(validLoginDto.email, validLoginDto.password);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockAuthService.login.mockRejectedValue(
        new NotFoundException('User with this email does exists'),
      );

      await expect(controller.login(validLoginDto)).rejects.toThrow(NotFoundException);
      await expect(controller.login(validLoginDto)).rejects.toThrow(
        'User with this email does exists',
      );
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new BadRequestException('Invalid credentials'));

      await expect(
        controller.login({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should propagate service errors during login', async () => {
      const serviceError = new Error('Database query failed');
      mockAuthService.login.mockRejectedValue(serviceError);

      await expect(controller.login(validLoginDto)).rejects.toThrow('Database query failed');
    });
  });
});
