import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(new ValidationPipe());

  // app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const config = new DocumentBuilder()
    .setTitle('Balancer Weighted Pool Demo')
    .setDescription('Documentation for Balancer Weighted Pool Demo REST APIs')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  return app.listen(process.env.PORT);
}

bootstrap();
