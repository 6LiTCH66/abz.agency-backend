import { IsNotEmpty } from "class-validator";

export class PositionDto{
  
  @IsNotEmpty()
  name: string
}