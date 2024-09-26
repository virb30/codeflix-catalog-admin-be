import { Controller, Get, INestApplication, UseFilters } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { InvalidCastMemberTypeError } from '../../../core/cast-member/domain/cast-member-type.vo';
import { InvalidCastMemberTypeErrorFilter } from './invalid-cast-member-type-error.filter';

@Controller('stub')
@UseFilters(new InvalidCastMemberTypeErrorFilter())
class StubController {
  @Get()
  index() {
    throw new InvalidCastMemberTypeError(1);
  }
}

describe('InvalidCastMemberTypeErrorFilter Unit Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });
  it('should catch a InvalidCastMemberTypeError', () => {
    return request(app.getHttpServer()).get('/stub').expect(422).expect({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: 'Invalid cast member type: 1',
    });
  });
});
