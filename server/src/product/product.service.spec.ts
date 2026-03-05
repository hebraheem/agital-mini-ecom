import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockProduct = {
    id: '123',
    name: 'Test Product',
    version: '1.0.0',
    shortDescription: 'Short desc',
    longDescription: 'Long desc',
    images: [],
    price: { reseller: 50, RRP: 100, discount: 50 },
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const createDto: any = {
        name: 'Test Product',
        price: '{"reseller":50,"RRP":100,"discount":50}',
        inStock: 'true',
      };
      const files: any = [{ filename: 'test.jpg', originalname: 'test.jpg' }];

      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.createProduct(createDto, files);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockPrismaService.product.create).toHaveBeenCalled();
    });
  });

  describe('getProduct', () => {
    it('should return a product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        reviews: [{ rating: 5 }, { rating: 4 }],
      });

      const result = await service.getProduct('123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).toHaveProperty('averageRating');
      expect(result.data).toHaveProperty('reviewCount');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.getProduct('999')).rejects.toThrow(NotFoundException);
      await expect(service.getProduct('999')).rejects.toThrow('Product with ID 999 not found');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const simpleProduct = { ...mockProduct, images: [] };
      mockPrismaService.product.findUnique.mockResolvedValue(simpleProduct);
      mockPrismaService.product.delete.mockResolvedValue(simpleProduct);

      const result = await service.deleteProduct('123');

      expect(result.success).toBe(true);
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({ where: { id: '123' } });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.deleteProduct('999')).rejects.toThrow(NotFoundException);
      await expect(service.deleteProduct('999')).rejects.toThrow('Product with ID 999 not found');
    });
  });
});
