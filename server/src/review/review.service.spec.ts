import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../product/product.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('ReviewService', () => {
  let service: ReviewService;
  let prismaService: PrismaService;
  let productService: ProductService;

  const mockPrismaService = {
    review: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockProductService = {
    getProduct: jest.fn(),
  };

  const mockReview = {
    id: '123',
    content: 'Great product',
    rating: 5,
    userId: 'user1',
    productId: 'prod1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    prismaService = module.get<PrismaService>(PrismaService);
    productService = module.get<ProductService>(ProductService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      const createDto = {
        content: 'Great product',
        rating: 5,
        productId: 'prod1',
      };

      mockProductService.getProduct.mockResolvedValue({ success: true, data: {} });
      mockPrismaService.review.findFirst.mockResolvedValue(null);
      mockPrismaService.review.create.mockResolvedValue(mockReview);

      const result = await service.createReview(createDto, 'user1');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should throw BadRequestException for invalid rating', async () => {
      const createDto = {
        content: 'Test',
        rating: 6,
        productId: 'prod1',
      };

      await expect(service.createReview(createDto, 'user1')).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if review already exists one user per review', async () => {
      const createDto = {
        content: 'Great product',
        rating: 5,
        productId: 'prod1',
      };

      mockProductService.getProduct.mockResolvedValue({ success: true, data: {} });
      mockPrismaService.review.findFirst.mockResolvedValue(mockReview);

      await expect(service.createReview(createDto, 'user1')).rejects.toThrow(ConflictException);
    });
  });

  describe('updateReview', () => {
    it('should update review successfully', async () => {
      const updateDto = { content: 'Updated review', rating: 4 };

      mockPrismaService.review.findFirst.mockResolvedValue(mockReview);
      mockPrismaService.review.update.mockResolvedValue({
        ...mockReview,
        ...updateDto,
      });

      const result = await service.updateReview('123', updateDto, 'user1');

      expect(result.success).toBe(true);
      expect(result.data!.content).toBe('Updated review');
    });
  });

  describe('deleteReview', () => {
    it('should delete review successfully', async () => {
      mockPrismaService.review.findFirst.mockResolvedValue(mockReview);
      mockPrismaService.review.delete.mockResolvedValue(mockReview);

      const result = await service.deleteReview('123', 'user1');

      expect(result.success).toBe(true);
    });
  });
});
