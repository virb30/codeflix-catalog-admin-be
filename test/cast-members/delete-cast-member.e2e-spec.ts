import request from 'supertest';
import { ICastMemberRepository } from '../../src/core/cast-member/domain/cast-member.repository';
import { CAST_MEMBER_PROVIDERS } from '../../src/nest-modules/cast-members-module/cast-members.provider';
import { startApp } from '../../src/nest-modules/shared-module/testing/helpers';
import { CastMember } from '../../src/core/cast-member/domain/cast-member.aggregate';

describe('CastMembersController (e2e)', () => {
  describe('/cast-members/:id (DELETE)', () => {
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
          .delete(`/cast-members/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should delete a category response with status 204', async () => {
      const castMemberRepo = appHelper.app.get<ICastMemberRepository>(
        CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );
      const castMember = CastMember.fake().aCastMember().build();
      await castMemberRepo.insert(castMember);

      await request(appHelper.app.getHttpServer())
        .delete(`/cast-members/${castMember.cast_member_id.id}`)
        .expect(204);

      await expect(
        castMemberRepo.findById(castMember.cast_member_id),
      ).resolves.toBeNull();
    });
  });
});
