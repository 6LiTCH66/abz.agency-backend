import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService, private jwtService: JwtService, private config: ConfigService) {}

  async generateToken(){
    const token = await this.jwtService.signAsync({}, {
      expiresIn: '40m',
      secret: this.config.get('JWT_SECRET_KEY'),

    });

    return {
      success: true,
      token: token
    }
  }

  validateToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.config.get('JWT_SECRET_KEY'),

    });
  }
}

