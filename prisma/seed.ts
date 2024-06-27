// seed.ts
import { NestFactory } from '@nestjs/core';
import {AppModule} from "../src/app.module";
import {PrismaService} from "../src/prisma/prisma.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prismaService = app.get(PrismaService);
  await prismaService.seedDb();
  await app.close();
}

bootstrap().catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
});
