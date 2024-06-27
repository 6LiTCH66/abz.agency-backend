import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ImageProcessingModule } from "../image-processing/image-processing.module";
import { PositionModule } from "../position/position.module";
import { PositionExistenceValidator } from "./validator";
import { AuthModule } from "../auth/auth.module";

@Module({
  providers: [UserService, PositionExistenceValidator],
  controllers: [UserController],
  imports: [ImageProcessingModule, PositionModule, AuthModule],
})
export class UserModule {}
