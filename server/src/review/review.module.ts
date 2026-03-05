import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [PrismaModule, ProductModule],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}
