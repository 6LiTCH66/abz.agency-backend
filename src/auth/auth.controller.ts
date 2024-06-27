import { Controller, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags('token')
@Controller('token')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Get a new token', description: 'Method returns a token that is required to register a new user.' })
  @Get()
  generateToken(){
    return this.authService.generateToken();
  }

}
