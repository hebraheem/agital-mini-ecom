import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { PublicUrl } from '../common/decorators/public.decorator';
import {
  CreateReviewDto,
  ReviewListResponseDto,
  ReviewParamDto,
  ReviewParamProDto,
  ReviewQueryDto,
  ReviewResponseDto,
} from './dto/review-create.dto';
import { UpdateReviewDto } from './dto/review-update.dto';
import { ResponseType } from '../common/types/response.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @PublicUrl()
  @Get(':productId')
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({
    status: 200,
    description: 'List of reviews retrieved successfully',
    type: ReviewListResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getReviews(@Param() param: ReviewParamProDto, @Query() query: ReviewQueryDto) {
    return this.reviewService.getAllReviews(param.productId, query);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiBody({ type: CreateReviewDto, description: 'Review creation data' })
  async createReview(@Body() createReviewDto: CreateReviewDto, @CurrentUser('sub') userId: string) {
    return this.reviewService.createReview(createReviewDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing review' })
  @ApiBearerAuth('bearer')
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiBody({ type: UpdateReviewDto, description: 'Review update data' })
  async updateReview(
    @Param() param: ReviewParamDto,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser('sub') userId: string,
  ): Promise<ResponseType<ReviewResponseDto>> {
    return this.reviewService.updateReview(param.id, updateReviewDto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async deleteReview(@Param() param: ReviewParamDto, @CurrentUser('sub') userId: string) {
    return this.reviewService.deleteReview(param.id, userId);
  }
}
