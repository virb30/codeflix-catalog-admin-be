import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICastMemberRepository } from '../../src/core/cast-member/domain/cast-member.repository';
import { CAST_MEMBER_PROVIDERS } from '../../src/nest-modules/cast-members-module/cast-members.provider';
import { startApp } from '../../src/nest-modules/shared-module/testing/helpers';
import { CastMember } from '../../src/core/cast-member/domain/cast-member.entity';
import { GetCastMemberFixture } from '../../src/nest-modules/cast-members-module/testing/cast-member-fixture';
import { CastMembersController } from '../../src/nest-modules/cast-members-module/cast-members.controller';
import { CastMemberOutputMapper } from '../../src/core/cast-member/application/use-cases/common/cast-member.output';

describe('CastMembersController (e2e)', () => {
  describe('/cast-members/:id (GET)', () => {
    const appHelper = startApp();
    describe('should return a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '86768766-12eb-40ea-b00c-4f8a81528bd5',
          expected: {
            message:
              'CastMember Not Found using ID 86768766-12eb-40ea-b00c-4f8a81528bd5',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(appHelper.app.getHttpServer())
          .get(`/cast-members/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should get a cast member', async () => {
      const castMemberRepo = appHelper.app.get<ICastMemberRepository>(
        CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );
      const castMember = CastMember.fake().aCastMember().build();
      await castMemberRepo.insert(castMember);

      const res = await request(appHelper.app.getHttpServer())
        .get(`/cast-members/${castMember.cast_member_id.id}`)
        .expect(200);

      const keysInResponse = GetCastMemberFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

      const presenter = CastMembersController.serialize(
        CastMemberOutputMapper.toOutput(castMember),
      );
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });
  });
});
