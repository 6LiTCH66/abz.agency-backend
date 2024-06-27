import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { useContainer } from "class-validator";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  useContainer(app.select(AppModule), {fallbackOnErrors: true})

  app.enableCors({
    allowedHeaders: ["Authorization", 'Content-Type'],
    origin: process.env.ORIGIN,
    credentials: true
  })

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('abz.agency test assignment')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1', app, document);


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        return new UnprocessableEntityException({
          success: false,
          message: 'Validation failed',
          fails: errors.reduce(
            (acc, e) => ({
              ...acc,
              [e.property]: Object.values(e.constraints),
            }),
            {},
          ),
        })
      }}));

  await app.listen(3000);
}
bootstrap();
