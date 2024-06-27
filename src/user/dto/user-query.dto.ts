import { IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiQuery } from "@nestjs/swagger";

export class UserQueryDto {


  @IsInt({message: 'The page must be an integer.'})
  @Min(1, {message: 'The page must be at least 1.'})
  @Type(() => Number)
  page: number = 1;

  @IsInt({message: 'The count must be an integer.'})
  @Type(() => Number)
  count: number = 5;
}