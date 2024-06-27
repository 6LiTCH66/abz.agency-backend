import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { PositionDto } from "./dto";

@Injectable()
export class PositionService {
  constructor(private prisma: PrismaService) {}

  async createPosition(dto: PositionDto) {
    return this.prisma.position.create({
      data:{
        ...dto
      }
    })
  }

  async getAllPositions() {
    const positions = await this.prisma.position.findMany();
    return {
      success: true,
      positions: positions
    }
  }

  async findPositionById(positionId: number){
    return this.prisma.position.findFirst({
      where:{
        id: positionId
      }
    })
  }

}
