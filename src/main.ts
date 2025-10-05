import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 1. Import ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    // 2. Add this option to get the raw body
    rawBody: true,
  });

  
  

  // Add this block to enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
  });
  
  // 2. Enable the ValidationPipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // This strips any properties from the request body that are not in our DTO
    }),
  );

  await app.listen(3000);
}
bootstrap();