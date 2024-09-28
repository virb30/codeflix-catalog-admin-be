import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { UpdateCastMemberFixture } from '../../src/nest-modules/cast-members-module/testing/cast-member-fixture';
import { ICastMemberRepository } from '../../src/core/cast-member/domain/cast-member.repository';
import { CAST_MEMBER_PROVIDERS } from '../../src/nest-modules/cast-members-module/cast-members.provider';
import { startApp } from '../../src/nest-modules/shared-module/testing/helpers';
import { Uuid } from '../../src/core/shared/domain/value-objects/uuid.vo';
import { CastMembersController } from '../../src/nest-modules/cast-members-module/cast-members.controller';
import { CastMemberOutputMapper } from '../../src/core/cast-member/application/use-cases/common/cast-member.output';
import { CastMember } from '../../src/core/cast-member/domain/cast-member.aggregate';

describe('CastMembersController (e2e)', () => {
  describe('/cast-members/:id (PATCH)', () => {
    describe('should return a response error when id is invalid or not found', () => {
      const appHelper = startApp();
      const faker = CastMember.fake().aCastMember();
      const arrange = [
        {
          id: '86768766-12eb-40ea-b00c-4f8a81528bd5',
          send_data: { name: faker.name },
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
          .patch(`/cast-members/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    describe('should return a response error with 422 status code when request body is invalid', () => {
      const appHelper = startApp();
      let castMemberRepo: ICastMemberRepository;

      beforeEach(() => {
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      const invalidRequest = UpdateCastMemberFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', async ({ value }) => {
        const castMember = CastMember.fake().aCastMember().build();
        await castMemberRepo.insert(castMember);
        return request(appHelper.app.getHttpServer())
          .patch(`/cast-members/${castMember.cast_member_id.id}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should return a response error with 422 status code when throw EntityValidationError', () => {
      const appHelper = startApp();
      const invalidRequest =
        UpdateCastMemberFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      let castMemberRepo: ICastMemberRepository;

      beforeEach(() => {
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      test.each(arrange)('when body is $label', async ({ value }) => {
        const castMember = CastMember.fake().aCastMember().build();
        await castMemberRepo.insert(castMember);
        return request(appHelper.app.getHttpServer())
          .patch(`/cast-members/${castMember.cast_member_id.id}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should return a response error with 422 status code when throw InvalidCastMemberTypeError', () => {
      const appHelper = startApp();
      const invalidRequest =
        UpdateCastMemberFixture.arrangeForInvalidCastMemberTypeError();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      let castMemberRepo: ICastMemberRepository;

      beforeEach(() => {
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      test.each(arrange)('when body is $label', async ({ value }) => {
        const castMember = CastMember.fake().aCastMember().build();
        await castMemberRepo.insert(castMember);
        return request(appHelper.app.getHttpServer())
          .patch(`/cast-members/${castMember.cast_member_id.id}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a cast memmber', () => {
      const appHelper = startApp();
      const arrange = UpdateCastMemberFixture.arrangeForUpdate();
      let castMemberRepo: ICastMemberRepository;

      beforeEach(async () => {
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const castMemberCreated = CastMember.fake().aCastMember().build();
          await castMemberRepo.insert(castMemberCreated);

          const res = await request(appHelper.app.getHttpServer())
            .patch(`/cast-members/${castMemberCreated.cast_member_id.id}`)
            .send(send_data)
            .expect(200);

          const keysInResponse = UpdateCastMemberFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);
          const id = res.body.data.id;
          const castMemberUpdated = await castMemberRepo.findById(new Uuid(id));

          const presenter = CastMembersController.serialize(
            CastMemberOutputMapper.toOutput(castMemberUpdated!),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual(serialized);

          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            created_at: serialized.created_at,
            name: expected.name ?? castMemberUpdated!.name,
            type: expected.type ?? castMemberUpdated!.type.type,
          });
        },
      );
    });
  });
});
