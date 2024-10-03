import { GenreCategoryModel, GenreModel } from '../genre-model';
import { GenreId } from '../../../../domain/genre.aggregate';
import { GenreModelMapper } from '../genre-model-mapper';
import { LoadEntityError } from '../../../../../shared/domain/validators/validation.error';
import { Genre } from '../../../../domain/genre.aggregate';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { CategoryModel } from '../../../../../category/infra/db/sequelize/category.model';
import { Category } from '../../../../../category/domain/category.aggregate';
import { ICategoryRepository } from 'src/core/category/domain/category.repository';
import { CategorySequelizeRepository } from 'src/core/category/infra/db/sequelize/category-sequelize.repository';

describe('GenreModelMapper Integration Tests', () => {
  let categoryRepo: ICategoryRepository;
  setupSequelize({ models: [CategoryModel, GenreModel, GenreCategoryModel] });

  beforeEach(() => {
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
  });

  test('should throws error when genre is invalid', () => {
    const arrange = [
      {
        makeModel: () => {
          //@ts-expect-error - an invalid genre
          return GenreModel.build({
            genre_id: '3fc57fd1-3bfd-4152-8324-cad4e0f5c59e',
            name: 't'.repeat(256),
            categories_id: [],
          });
        },
        expectedErrors: [
          {
            categories_id: ['categories_id should not be empty'],
          },
          {
            name: ['name must be shorter than or equal to 255 characters'],
          },
        ],
      },
    ];

    expect.assertions(2);
    for (const item of arrange) {
      try {
        GenreModelMapper.toEntity(item.makeModel());
        fail('The genre is valid but it needs throws a LoadEntityError');
      } catch (e) {
        expect(e).toBeInstanceOf(LoadEntityError);
        expect(e.error).toMatchObject(item.expectedErrors);
      }
    }
  });

  test('should convert a genre model to a genre entity', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    categoryRepo.bulkInsert([category1, category2]);
    const created_at = new Date();
    const genre_id = new GenreId();
    const model = await GenreModel.create(
      {
        genre_id: genre_id.id,
        name: 'some name',
        categories_id: [
          GenreCategoryModel.build({
            genre_id: genre_id.id,
            category_id: category1.category_id.id,
          }),
          GenreCategoryModel.build({
            genre_id: genre_id.id,
            category_id: category2.category_id.id,
          }),
        ],
        is_active: true,
        created_at,
      },
      {
        include: ['categories_id'],
      },
    );
    const entity = GenreModelMapper.toEntity(model);
    expect(entity.toJSON()).toStrictEqual(
      new Genre({
        genre_id,
        name: 'some name',
        categories_id: new Map([
          [category1.category_id.id, category1.category_id],
          [category2.category_id.id, category2.category_id],
        ]),
        is_active: true,
        created_at,
      }).toJSON(),
    );
  });
});
