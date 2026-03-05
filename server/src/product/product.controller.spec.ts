import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;

  const mockProductService = {
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    getProduct: jest.fn(),
    getProducts: jest.fn(),
    deleteProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: { id: '123', name: 'Test Product' },
      };
      const files: any = [];
      const body: any = { name: 'Test Product', price: '{}', inStock: 'true' };

      mockProductService.createProduct.mockResolvedValue(mockResponse);

      const result = await controller.createProduct(files, body);

      expect(result).toEqual(mockResponse);
      expect(productService.createProduct).toHaveBeenCalledWith(body, files);
    });
  });

  describe('getProduct', () => {
    it('should return a product', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: { id: '123', name: 'Test Product' },
      };

      mockProductService.getProduct.mockResolvedValue(mockResponse);

      const result = await controller.getProduct('123');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getProducts', () => {
    it('should return all products', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: [{ id: '123', name: 'Test Product' }],
      };

      mockProductService.getProducts.mockResolvedValue(mockResponse);

      const result = await controller.getProducts({});

      expect(result).toEqual(mockResponse);
      expect(productService.getProducts).toHaveBeenCalledWith({});
    });

    it('should return products filtered by inStock query', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: [{ id: '123', name: 'In Stock Product', inStock: true }],
      };

      mockProductService.getProducts.mockResolvedValue(mockResponse);

      const result = await controller.getProducts({ inStock: 'true' });

      expect(result).toEqual(mockResponse);
      expect(productService.getProducts).toHaveBeenCalledWith({ inStock: 'true' });
    });

    it('should return products filtered by search query', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: [{ id: '123', name: 'Wireless Headphones', inStock: true }],
      };

      mockProductService.getProducts.mockResolvedValue(mockResponse);

      const result = await controller.getProducts({ search: 'Wireless' });

      expect(result).toEqual(mockResponse);
      expect(productService.getProducts).toHaveBeenCalledWith({ search: 'Wireless' });
    });

    it('should return products filtered by both inStock and search query', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: [{ id: '123', name: 'Wireless Headphones', inStock: true }],
      };

      mockProductService.getProducts.mockResolvedValue(mockResponse);

      const result = await controller.getProducts({ inStock: 'true', search: 'Wireless' });

      expect(result).toEqual(mockResponse);
      expect(productService.getProducts).toHaveBeenCalledWith({
        inStock: 'true',
        search: 'Wireless',
      });
    });

    it('should handle inStock=false query parameter', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: [{ id: '456', name: 'Out of Stock Product', inStock: false }],
      };

      mockProductService.getProducts.mockResolvedValue(mockResponse);

      const result = await controller.getProducts({ inStock: 'false' });

      expect(result).toEqual(mockResponse);
      expect(productService.getProducts).toHaveBeenCalledWith({ inStock: 'false' });
    });

    it('should handle pagination query parameters', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: [{ id: '123', name: 'Test Product' }],
        meta: { currentPage: 2, totalPages: 5 },
      };

      mockProductService.getProducts.mockResolvedValue(mockResponse);

      const result = await controller.getProducts({ page: 2, limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(productService.getProducts).toHaveBeenCalledWith({ page: 2, limit: 10 });
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: { message: 'Product deleted' },
      };

      mockProductService.deleteProduct.mockResolvedValue(mockResponse);

      const result = await controller.deleteProduct('123');

      expect(result).toEqual(mockResponse);
    });
  });
});
