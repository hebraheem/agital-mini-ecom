import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateReviewDto,
  ReviewListResponseDto,
  ReviewQueryDto,
  ReviewResponseDto,
} from './dto/review-create.dto';
import { UpdateReviewDto } from './dto/review-update.dto';
import { ResponseType } from '../common/types/response.type';
import { PrismaService } from '../prisma/prisma.service';
import { PaginateQuery } from '../common/classes/paginate-query';

@Injectable()
export class ReviewService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Retrieves all reviews for a specific product, with optional pagination and filtering by rating.
   * @param productId - The ID of the product for which to retrieve reviews.
   * @param query - An object containing pagination parameters (page, limit) and an optional rating filter.
   * @returns A promise that resolves to a paginated list of reviews matching the criteria.
   * */
  getAllReviews(productId: string, query: ReviewQueryDto): Promise<ReviewListResponseDto> {
    const { page = 1, limit = 10, rating } = query;
    const where: any = { productId };
    if (rating) {
      where.rating = rating;
    }
    const include = {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    };
    const paginator = new PaginateQuery(this.prismaService.review, page, limit, where, include);
    return paginator.paginate() as Promise<ReviewListResponseDto>;
  }

  /**
   * Creates a new review for a product, ensuring that the user has not already reviewed the same product and that the rating is within the valid range.
   * @param createReviewDto - An object containing the review data (content, rating, productId).
   * @param userId - The ID of the user creating the review, used to ensure that a user can only review a product once.
   * @returns A promise that resolves to a response containing the created review data.
   * @throws BadRequestException if the rating is not between 1 and 5.
   * @throws NotFoundException if the specified product does not exist.
   * @throws ConflictException if the user has already reviewed the specified product.
   * */
  async createReview(
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<ResponseType<Partial<ReviewResponseDto>>> {
    const { content, rating, productId } = createReviewDto;

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Before upsert 250 review creation to 38 seconds and after upsert 250 review creation to 5.5 seconds
    const data = await this.prismaService.review.upsert({
      create: { content, rating, productId, userId },
      update: { content, rating },
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
      select: { id: true },
    });

    if (!data) {
      throw new ConflictException('You already reviewed this product or product not found');
    }

    return {
      success: true,
      error: null,
      data,
    };
  }

  /**
   * !!! Left for reference only, the upsert method in createReview already handles both create and update operations for reviews. !!!
   * Updates an existing review by its ID, ensuring that the review belongs to the specified user.
   * @param id - The ID of the review to be updated.
   * @param updateReviewDto - An object containing the updated review data (content and/or rating).
   * @param userId - The ID of the user attempting to update the review, used for authorization.
   * @returns A promise that resolves to a response containing the updated review data.
   * @throws NotFoundException if the review with the specified ID does not exist or does not belong to the user.
   * */
  async updateReview(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: string,
  ): Promise<ResponseType<ReviewResponseDto>> {
    const review = await this.prismaService.review.findFirst({
      where: { id, userId },
    });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    const updatedReview = await this.prismaService.review.update({
      where: { id },
      data: updateReviewDto,
    });
    return {
      success: true,
      error: null,
      data: updatedReview,
    };
  }

  /**
   * Deletes a review by its ID, ensuring that the review belongs to the specified user.
   * @param id - The ID of the review to be deleted.
   * @param userId - The ID of the user attempting to delete the review, used for authorization.
   * @returns A promise that resolves to a response indicating the success of the deletion operation.
   * @throws NotFoundException if the review with the specified ID does not exist or does not belong to the user.
   * */
  async deleteReview(id: string, userId: string): Promise<ResponseType<any>> {
    const where: any = { id, userId };
    const deleted = await this.prismaService.review.delete(where);
    if (!deleted) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    return {
      success: true,
      data: { message: 'Review deleted successfully' },
      error: null,
    };
  }
}
