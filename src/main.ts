import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('API documentation')
    .setDescription('API for the Blogs Management System application')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('/api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API Docs',
    customCssUrl: 'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js',
    ],
    customfavIcon: 'https://unpkg.com/swagger-ui-dist@4.15.5/favicon-32x32.png',
  });

  await app.listen(3000);
}
bootstrap();
