import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

describe('ReviewController', () => {
  let controller: ReviewController;
  let reviewService: ReviewService;

  const mockReviewService = {
    getAllReviews: jest.fn(),
    createReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: mockReviewService,
        },
      ],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
    reviewService = module.get<ReviewService>(ReviewService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getReviews', () => {
    it('should return all reviews for a product', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: [{ id: '1', content: 'Great!', rating: 5 }],
        meta: { totalItems: 1 },
      };

      mockReviewService.getAllReviews.mockResolvedValue(mockResponse);

      const result = await controller.getReviews({ productId: 'prod1' }, { page: 1, limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(reviewService.getAllReviews).toHaveBeenCalledWith('prod1', { page: 1, limit: 10 });
      expect(result).toMatchObject(mockResponse);
    });

    it('should return reviews with pagination query parameters', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: [
          { id: '1', content: 'Review 1', rating: 5 },
          { id: '2', content: 'Review 2', rating: 4 },
        ],
        meta: { totalItems: 20, currentPage: 2, totalPages: 4 },
      };

      mockReviewService.getAllReviews.mockResolvedValue(mockResponse);

      const result = await controller.getReviews({ productId: 'prod1' }, { page: 2, limit: 5 });

      expect(result).toEqual(mockResponse);
      expect(reviewService.getAllReviews).toHaveBeenCalledWith('prod1', { page: 2, limit: 5 });
      expect(result.meta.currentPage).toBe(2);
    });

    it('should return reviews filtered by rating query parameter', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: [
          { id: '1', content: 'Excellent!', rating: 5 },
          { id: '2', content: 'Perfect!', rating: 5 },
        ],
        meta: { totalItems: 2 },
      };

      mockReviewService.getAllReviews.mockResolvedValue(mockResponse);

      const result = await controller.getReviews(
        { productId: 'prod1' },
        { page: 1, limit: 10, rating: 5 },
      );

      expect(result).toEqual(mockResponse);
      expect(reviewService.getAllReviews).toHaveBeenCalledWith('prod1', {
        page: 1,
        limit: 10,
        rating: 5,
      });
      expect(result.data.every((review) => review.rating === 5)).toBe(true);
    });

    it('should return reviews with all query parameters (pagination + rating)', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: [{ id: '1', content: 'Good product', rating: 4 }],
        meta: { totalItems: 5, currentPage: 1, totalPages: 2 },
      };

      mockReviewService.getAllReviews.mockResolvedValue(mockResponse);

      const result = await controller.getReviews(
        { productId: 'prod1' },
        { page: 1, limit: 3, rating: 4 },
      );

      expect(result).toEqual(mockResponse);
      expect(reviewService.getAllReviews).toHaveBeenCalledWith('prod1', {
        page: 1,
        limit: 3,
        rating: 4,
      });
    });

    it('should handle default pagination values when not provided', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: [{ id: '1', content: 'Review', rating: 3 }],
        meta: { totalItems: 1 },
      };

      mockReviewService.getAllReviews.mockResolvedValue(mockResponse);

      const result = await controller.getReviews({ productId: 'prod1' }, {});

      expect(result).toEqual(mockResponse);
      expect(reviewService.getAllReviews).toHaveBeenCalledWith('prod1', {});
    });
  });

  describe('createReview', () => {
    it('should create a review', async () => {
      const createDto: any = {
        content: 'Great product',
        rating: 5,
        productId: 'prod1',
      };
      const mockResponse = {
        success: true,
        error: null,
        data: { id: '123', ...createDto },
      };

      mockReviewService.createReview.mockResolvedValue(mockResponse);

      const result = await controller.createReview(createDto, 'user1');

      expect(result).toEqual(mockResponse);
      expect(reviewService.createReview).toHaveBeenCalledWith(createDto, 'user1');
    });
  });

  describe('updateReview', () => {
    it('should update a review', async () => {
      const updateDto: any = { content: 'Updated', rating: 4 };
      const mockResponse = {
        success: true,
        error: null,
        data: { id: '123', ...updateDto },
      };

      mockReviewService.updateReview.mockResolvedValue(mockResponse);

      const result = await controller.updateReview({ id: '123' }, updateDto, 'user1');

      expect(result).toEqual(mockResponse);
      expect(reviewService.updateReview).toHaveBeenCalledWith('123', updateDto, 'user1');
    });
  });

  describe('deleteReview', () => {
    it('should delete a review', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: { message: 'Review deleted' },
      };

      mockReviewService.deleteReview.mockResolvedValue(mockResponse);

      const result = await controller.deleteReview({ id: '123' }, 'user1');

      expect(result).toEqual(mockResponse);
      expect(reviewService.deleteReview).toHaveBeenCalledWith('123', 'user1');
    });
  });
});
