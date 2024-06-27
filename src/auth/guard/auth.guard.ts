import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers

    if (!authorization || authorization.trim() === '') {

      throw new UnauthorizedException({
        success: false,
        message: 'Invalid token. Try to get a new one by the method GET api/v1/token.',
      })
    }

    const bearerToken = authorization.substring(7)

    try{

      this.authService.validateToken(bearerToken)

      return true;

    }catch (err){

      throw new UnauthorizedException({
        success: false,
        message: "The token expired."
      })

    }
  }
}
