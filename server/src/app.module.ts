import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalConfigModule } from './config/config.module';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { ExceptionsFilter } from './common/filters/exception.filter';
import { UserModule } from './user/user.module';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [GlobalConfigModule, AuthModule, UserModule, ProductModule, PrismaModule],
  controllers: [AppController, ProductController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ProductService,
  ],
})
export class AppModule {}
