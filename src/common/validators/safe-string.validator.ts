import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function IsSafeString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "IsSafeString",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== "string") return false;

          const hasHtmlTags = /<[^>]*>/g.test(value);
          if (hasHtmlTags) return false;

          const dangerousPatterns = [
            /on\w+\s*=/gi,
            /javascript:/gi,
            /data:text\/html/gi,
            /<script/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
          ];

          return !dangerousPatterns.some((pattern) => pattern.test(value));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contém caracteres ou padrões não permitidos`;
        },
      },
    });
  };
}
