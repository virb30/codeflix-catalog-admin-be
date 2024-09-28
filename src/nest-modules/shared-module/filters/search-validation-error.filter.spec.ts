import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { SearchValidationError } from '../../../core/shared/domain/validators/validation.error';
import { SearchValidationErrorFilter } from './search-validation-error.filter';

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new SearchValidationError([
      'another error',
      {
        field1: ['field1 is required', 'error 2'],
      },
      {
        field2: ['field2 is required'],
      },
    ]);
  }
}

describe('NotFoundFilter Unit Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new SearchValidationErrorFilter());
    await app.init();
  });
  it('should catch a SearchValidationError', () => {
    return request(app.getHttpServer())
      .get('/stub')
      .expect(422)
      .expect({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: [
          'another error',
          'field1 is required',
          'error 2',
          'field2 is required',
        ],
      });
  });
});
