import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserDto, UserParamDto } from "./dto";
import { ImageProcessingService } from "../image-processing/image-processing.service";
import { PositionService } from "../position/position.service";
import { User } from "@prisma/client";
import { UserQueryDto } from "./dto/user-query.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private imageProcessingService: ImageProcessingService, private config: ConfigService) {}


  async getUsers(userQueryDto: UserQueryDto) {
    const baseUrl = this.config.get('BASE_URL');

    const results: {next_url: string | null, prev_url: string | null} = {
      next_url: null,
      prev_url: null
    }

    const totalUsers = await this.prisma.user.findMany();
    const totalPages = Math.ceil(totalUsers.length / userQueryDto.count);

    if (totalPages < userQueryDto.page) {
      throw new NotFoundException({
        success: false,
        message: "Page not found"
      });
    }

    const startIndex = (userQueryDto.page - 1) * userQueryDto.count
    const endIndex = userQueryDto.count

    const paginatedUsers = await this.prisma.user.findMany({
      skip: startIndex,
      take: endIndex,
    });

    if (totalPages > userQueryDto.page) {
      results.next_url = `${baseUrl}/api/v1/users?page=${userQueryDto.page + 1}&count=${userQueryDto.count}`
    }else{
      results.next_url = null
    }


    if (startIndex > 0) {
      results.prev_url = `${baseUrl}/api/v1/users?page=${userQueryDto.page - 1}&count=${userQueryDto.count}`
    }else{
      results.prev_url = null
    }


    return {
      success: true,
      page: userQueryDto.page,
      total_pages: totalPages,
      total_users: totalUsers.length,
      count: userQueryDto.count,
      links: results,
      users: paginatedUsers,
    }
  }

  async getUserById(userParamDto: UserParamDto){

    const user = await this.prisma.user.findUnique({
      where: {
        id: userParamDto.userId
      }
    })

    if (!user){

      throw new NotFoundException({
        success: false,
        message: "User not found"
      })
    }else{
      return {
        success: true,
        user: user
      }
    }


  }

  async createUser(userDto: UserDto){

    const candidate = await this.prisma.user.findFirst({
      where: {
        OR:[
          {phone: userDto.phone},
          {email: userDto.email},
        ]
      }
    })

    if (!candidate) {
      const imagePath = await this.imageProcessingService.processImage(userDto.photo)

      const newUser: User = await this.prisma.user.create({
        data: {
          ...userDto,
          photo: `${this.config.get("BASE_URL")}/${imagePath}`
        }
      })

      if (newUser) {
        return {
          "success": true,
          "user_id": newUser.id,
          "message": "New user successfully registered"
        }
      }
    }
    else{
      throw new HttpException({
        success: false,
        message: "User with this phone or email already exist"
      }, HttpStatus.CONFLICT)

    }
  }
}
