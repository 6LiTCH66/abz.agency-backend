import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from "@nestjs/config";
import { PositionModule } from './position/position.module';
import { FileSystemStoredFile, NestjsFormDataModule } from "nestjs-form-data";
import { join } from "path";
import { ImageProcessingModule } from './image-processing/image-processing.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
  imports: [
    NestjsFormDataModule.configAsync({
      isGlobal: true,
      useFactory: () => ({
        storage: FileSystemStoredFile,
        fileSystemStoragePath: join(process.cwd(), '.', 'images'),
        cleanupAfterSuccessHandle: true,
      })
    }),
    ConfigModule.forRoot({isGlobal: true}),

    UserModule,
    PrismaModule,
    PositionModule,
    ImageProcessingModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '.', 'images'),
      serveRoot: '/images',
    }),
  ]
  ,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
