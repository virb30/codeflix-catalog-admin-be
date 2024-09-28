import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { UpdateCateogryFixture } from '../../src/nest-modules/categories-module/testing/category-fixture';
import { ICategoryRepository } from '../../src/core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from '../../src/nest-modules/categories-module/categories.provider';
import { startApp } from '../../src/nest-modules/shared-module/testing/helpers';
import { Uuid } from '../../src/core/shared/domain/value-objects/uuid.vo';
import { CategoriesController } from '../../src/nest-modules/categories-module/categories.controller';
import { CategoryOutputMapper } from '../../src/core/category/application/use-cases/common/category-output';
import { Category } from '../../src/core/category/domain/category.aggregate';

describe('CategoriesController (e2e)', () => {
  const uuid = '86768766-12eb-40ea-b00c-4f8a81528bd5';

  describe('/categories/:id (PATCH)', () => {
    describe('should return a response error when id is invalid or not found', () => {
      const appHelper = startApp();
      const faker = Category.fake().aCategory();
      const arrange = [
        {
          id: '86768766-12eb-40ea-b00c-4f8a81528bd5',
          send_data: { name: faker.name },
          expected: {
            message:
              'Category Not Found using ID 86768766-12eb-40ea-b00c-4f8a81528bd5',
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
          .patch(`/categories/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    describe('should return a response error with 422 status code when request body is invalid', () => {
      const appHelper = startApp();
      const invalidRequest = UpdateCateogryFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .patch(`/categories/${uuid}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should return a response error with 422 status code when throw EntityValidationError', () => {
      const appHelper = startApp();
      const invalidRequest =
        UpdateCateogryFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      let categoryRepo: ICategoryRepository;

      beforeEach(() => {
        categoryRepo = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });

      test.each(arrange)('when body is $label', async ({ value }) => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        return request(appHelper.app.getHttpServer())
          .patch(`/categories/${category.category_id.id}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a category', () => {
      const appHelper = startApp();
      const arrange = UpdateCateogryFixture.arrangeForUpdate();
      let categoryRepo: ICategoryRepository;

      beforeEach(async () => {
        categoryRepo = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });

      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const categoryCreated = Category.fake().aCategory().build();
          await categoryRepo.insert(categoryCreated);

          const res = await request(appHelper.app.getHttpServer())
            .patch(`/categories/${categoryCreated.category_id.id}`)
            .send(send_data)
            .expect(200);

          const keysInResponse = UpdateCateogryFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);
          const id = res.body.data.id;
          const categoryUpdated = await categoryRepo.findById(new Uuid(id));

          const presenter = CategoriesController.serialize(
            CategoryOutputMapper.toOutput(categoryUpdated),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual(serialized);

          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            created_at: serialized.created_at,
            name: expected.name ?? categoryUpdated.name,
            description:
              'description' in expected
                ? expected.description
                : categoryUpdated.description,
            is_active: expected.is_active ?? categoryUpdated.is_active,
          });
        },
      );
    });
  });
});
