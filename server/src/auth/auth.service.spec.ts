import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRequestDto } from './types/user.type';

// Mock bcrypt module
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'auth.bcryptRounds': '10',
        'auth.jwtSecret': 'test-secret',
        'auth.jwtExpiresIn': '3600',
        'auth.jwtRefreshSecret': 'test-refresh-secret',
        'auth.jwtRefreshExpiresIn': '86400',
      };
      return config[key];
    }),
  };

  const mockJwtService = {
    sign: jest.fn((payload, options) => {
      return `mock.jwt.token.${payload.sub}`;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const validUserDto: UserRequestDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
      birthdate: null,
    };

    const mockCreatedUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      birthdate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully register a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.register(validUserDto);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe('123');
      expect(result.data!.email).toBe('test@example.com');
      expect(result.data!.token).toBeDefined();
      expect(result.data!.token.accessToken).toBeDefined();
      expect(result.data!.token.refreshToken).toBeDefined();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: validUserDto.email },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockCreatedUser);

      await expect(service.register(validUserDto)).rejects.toThrow(ConflictException);
      await expect(service.register(validUserDto)).rejects.toThrow(
        'User with this email already exists',
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should hash the password before saving', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      await service.register(validUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(validUserDto.password, 10);
    });

    it('should handle birthdate conversion', async () => {
      const userWithBirthdate: UserRequestDto = {
        ...validUserDto,
        birthdate: new Date('1990-01-01'),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockCreatedUser,
        birthdate: new Date('1990-01-01'),
      });

      await service.register(userWithBirthdate);

      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should not include password in response', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.register(validUserDto);

      expect(result.data).not.toHaveProperty('password');
    });

    it('should generate both access and refresh tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.register(validUserDto);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result.data!.token.accessToken).toBeDefined();
      expect(result.data!.token.refreshToken).toBeDefined();
    });
  });

  describe('login', () => {
    const mockUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      birthdate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully login with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@example.com', 'Password123');

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data!.accessToken).toBeDefined();
      expect(result.data!.refreshToken).toBeDefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login('nonexistent@example.com', 'Password123')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.login('nonexistent@example.com', 'Password123')).rejects.toThrow(
        'User with this email does exists',
      );
    });

    it('should throw BadRequestException if password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@example.com', 'WrongPassword')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login('test@example.com', 'WrongPassword')).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should call bcrypt.compare with correct arguments', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login('test@example.com', 'Password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('Password123', 'hashedPassword');
    });

    it('should generate tokens with correct payload', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login('test@example.com', 'Password123');

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
        expect.objectContaining({
          secret: 'test-secret',
          expiresIn: '3600',
        }),
      );
    });

    it('should generate refresh token with correct secret and expiration', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login('test@example.com', 'Password123');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          secret: 'test-refresh-secret',
          expiresIn: '86400',
        }),
      );
    });

    it('should handle case-sensitive email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login('Test@Example.com', 'Password123')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'Test@Example.com' },
      });
    });
  });
});
