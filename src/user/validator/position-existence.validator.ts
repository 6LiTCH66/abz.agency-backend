import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { PositionService } from "../../position/position.service";
import { Injectable } from "@nestjs/common";


@ValidatorConstraint({async: true})
@Injectable()
export class PositionExistenceValidator implements ValidatorConstraintInterface{
  constructor(private positionService: PositionService) {}

  async validate(position_id: number) {
    const position = await this.positionService.findPositionById(position_id)
    return !!position
  }

  defaultMessage(validationArguments?: ValidationArguments) {
    return `Position with id: '${validationArguments.value}' does not exist.`
  }
}

export function IsPositionExist(validationOptions?: ValidationOptions){
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: PositionExistenceValidator,
    });
  };
}