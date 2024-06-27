import { Body, Controller, Get, Post } from "@nestjs/common";
import { PositionService } from "./position.service";
import { PositionDto } from "./dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";


@ApiTags('positions')
@Controller('positions')
export class PositionController {
  constructor(private positionService: PositionService) {}

  @ApiOperation({ summary: 'Get users positions', description: "Returns a list of all available users positions." })
  @Get()
  getAllPositions() {
    return this.positionService.getAllPositions();
  }

  // @Post()
  // createPosition(@Body() dto: PositionDto) {
  //   return this.positionService.createPosition(dto);
  // }

}
