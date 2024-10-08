import request from 'supertest';
import { ICategoryRepository } from '../../src/core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from '../../src/nest-modules/categories-module/categories.provider';
import { startApp } from '../../src/nest-modules/shared-module/testing/helpers';
import { Category } from '../../src/core/category/domain/category.aggregate';

describe('CategoriesController (e2e)', () => {
  describe('/categories/:id (DELETE)', () => {
    const appHelper = startApp();
    describe('should return a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '86768766-12eb-40ea-b00c-4f8a81528bd5',
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
          .delete(`/categories/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should delete a category response with status 204', async () => {
      const categoryRepo = appHelper.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      await request(appHelper.app.getHttpServer())
        .delete(`/categories/${category.category_id.id}`)
        .expect(204);

      await expect(
        categoryRepo.findById(category.category_id),
      ).resolves.toBeNull();
    });
  });
});
