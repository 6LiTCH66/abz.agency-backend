import { IsInt, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";

export class UserParamDto {

  @IsNotEmpty()
  @IsInt({message: "The user must be an integer."})
  @Type(() => Number)
  userId: number
}