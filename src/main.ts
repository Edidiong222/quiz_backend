import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  // This a how we use validation pipes globally, this enforces the validation put it place by the class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.enableCors();
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
