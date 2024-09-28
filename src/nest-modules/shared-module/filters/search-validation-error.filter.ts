import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { SearchValidationError } from '../../../core/shared/domain/validators/validation.error';
import { union } from 'lodash';

@Catch(SearchValidationError)
export class SearchValidationErrorFilter implements ExceptionFilter {
  catch(exception: SearchValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();

    response.status(422).json({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: union(
        ...exception.error.reduce(
          (acc, error) =>
            acc.concat(
              //@ts-expect-error - error can be string
              typeof error === 'string' ? [[error]] : Object.values(error),
            ),
          [] as string[],
        ),
      ),
    });
  }
}
