import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsEitherPhoneOrEmailConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any) {
    const { email, phoneNumber } = value;
    return Boolean(email || phoneNumber);
  }

  defaultMessage(): string {
    return 'You must provide either an email address or a phone number.';
  }
}

export function IsEitherPhoneOrEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEitherPhoneOrEmailConstraint,
    });
  };
}
