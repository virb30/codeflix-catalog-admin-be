import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { InvalidCastMemberTypeError } from '../../../core/cast-member/domain/cast-member-type.vo';

@Catch(InvalidCastMemberTypeError)
export class InvalidCastMemberTypeErrorFilter implements ExceptionFilter {
  catch(exception: InvalidCastMemberTypeError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();

    response.status(422).json({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: exception.message,
    });
  }
}
