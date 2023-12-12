import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { SignUpDTO } from 'src/auth/dtos/sign-up.dto';

export function IsEitherPhoneOrEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEitherPhoneOrEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(_value: any, args: ValidationArguments) {
          const object = args.object as SignUpDTO;
          return Boolean(object.email || object.phoneNumber);
        },
        defaultMessage() {
          return 'You must provide either an email address or a phone number.';
        },
      },
    });
  };
}
