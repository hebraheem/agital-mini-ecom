import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix: string | undefined = configService.get('app.apiPrefix');
  const apiVersion: string | undefined = configService.get('app.apiVersion');
  const corsOrigin: string | undefined = configService.get('app.corsOrigin');
  console.log('corsOrigin', corsOrigin);

  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

  app.enableCors({
    origin: 'http://localhost:5173', //corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('Agital API')
    .setDescription('Agital Mini E-commerce API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'bearer',
    )
    .addTag('Auth', 'Auth registration and login endpoints')
    .addTag('Users', 'User management and profile operations')
    .addTag('Products', 'Product management and profile operations')
    .addTag('Reviews', 'Review management and profile operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      showExtensions: true,
      filter: true,
      deepLinking: true,
    },
    customCss: `
      .topbar { display: none; }
      .swagger-ui .topbar { display: none; }
    `,
  });

  await app.listen(process.env.PORT!, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    console.log(`API documentation available at http://localhost:${process.env.PORT}/docs`);
  });
}

bootstrap();
