import {
  Body,
  Controller,
  Get, Param,
  Post, Query, UseGuards
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UserDto, UserParamDto } from "./dto";
import { FormDataRequest } from "nestjs-form-data";
import { AuthGuard } from "../auth/guard/auth.guard";
import { UserQueryDto } from "./dto/user-query.dto";
import { ApiConsumes, ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}


  @ApiOperation({ summary: 'Create user', description: "User registration request."})
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'Token',
    description: 'Bearer token',
    required: true,
  })

  @UseGuards(AuthGuard)
  @Post()
  @FormDataRequest()
  createUser(@Body() dto: UserDto) {
    return this.userService.createUser(dto);
  }

  @ApiOperation({ summary: 'Returns a list of users.', description: "Returns users data from a database divided into pages and sorted by ID in the ascending order."})
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Specify the page that you want to retrieve',
    example: '2',
    type: 'integer'
  })
  @ApiQuery({
    name: 'count',
    required: false,
    description: 'Specify the amount of items that will be retrieved per page',
    example: '10',
    type: 'integer'
  })
  @Get()
  getAllUsers(@Query() userQueryDto: UserQueryDto) {
    return this.userService.getUsers(userQueryDto);
  }

  @ApiOperation({ summary: 'Returns a user by id.', description: "Get user by id. Return information about user by his id. This meathod can be used to obtain a specific user for the site header."})
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'The id of the resource in the database',
    example: "5"

  })
  @Get(":userId")
  getUserById(@Param() userParamDto: UserParamDto) {
    return this.userService.getUserById(userParamDto);
  }
}
