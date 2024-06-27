import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  MinLength,
  ValidateIf
} from "class-validator";
import { FileSystemStoredFile, HasMimeType, IsFile, MaxFileSize } from "nestjs-form-data";
import { IsPositionExist } from "../validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class UserDto{

  @ApiProperty({
    description: 'The name must be at least 2 characters..',
    minLength: 2,
    maxLength: 60,
  })
  @IsNotEmpty({message: "The name must be at least 2 characters."})
  @MinLength(2, { message: "The name must be at least 2 characters."})
  name: string;

  @ApiProperty({
    description: 'User email, must be a valid email according to RFC2822.',
  })
  @IsNotEmpty()
  @IsEmail({}, {message: "The email must be a valid email address."})
  email: string;

  @ApiProperty({
    description: 'User phone number. Number should start with code of Ukraine +380.',
  })

  @IsPhoneNumber("UA")
  @IsNotEmpty({message: "The phone field is required."})
  phone: string;

  @ApiProperty({
    description: 'User`s position id. You can get list of all positions with their IDs using the API method GET api/v1/positions.',
    type: Number,
  })

  @IsNotEmpty()
  @IsPositionExist()
  @IsNumber({},{message: "The position id must be an integer."})
  @Type(() => Number)
  position_id: number;

  @ApiProperty({
    description: 'Minimum size of photo 70x70px. The photo format must be jpeg/jpg type. The photo size must not be greater than 5 Mb.',
    type: 'string',
    format: 'binary',
  })
  @IsFile()
  @MaxFileSize(5 * 1024 * 1024, {message: "The photo size must not be greater than 5 Mb"})
  @HasMimeType(['image/jpeg', 'image/png'])
  photo: FileSystemStoredFile
}