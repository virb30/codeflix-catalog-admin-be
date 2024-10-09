import { GenreCategoryModel, GenreModel } from '../genre-model';
import { GenreSequelizeRepository } from '../genre-sequelize.repository';
import { Genre } from '../../../../domain/genre.aggregate';
import { GenreId } from '../../../../domain/genre.aggregate';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { GenreModelMapper } from '../genre-model-mapper';
import {
  GenreSearchParams,
  GenreSearchResult,
} from '../../../../domain/genre.repository';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { CategoryModel } from '../../../../../category/infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '../../../../../category/infra/db/sequelize/category-sequelize.repository';
import { Category } from '../../../../../category/domain/category.aggregate';
import { UnitOfWorkSequelize } from 'src/core/shared/infra/db/sequelize/unit-of-work-sequelize';

describe('GenreSequelizeRepository Integration Test', () => {
  const sequelize = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });
  let uow: UnitOfWorkSequelize;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelize.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
  });

  it('should insert a new genre', async () => {
    const category = Category.fake().aCategory().build();
    categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);

    const newGenre = await genreRepo.findById(genre.genre_id);
    expect(newGenre!.toJSON()).toStrictEqual(genre.toJSON());
  });

  it('should bulk insert new entities', async () => {
    const categories = Category.fake().theCategories(3).build();
    categoryRepo.bulkInsert(categories);
    const genres = Genre.fake()
      .theGenres(2)
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .addCategoryId(categories[2].category_id)
      .build();
    await genreRepo.bulkInsert(genres);

    const newGenres = await genreRepo.findAll();
    expect(newGenres.length).toBe(2);
    expect(newGenres[0].toJSON()).toStrictEqual({
      ...genres[0].toJSON(),
      categories_id: expect.arrayContaining([
        categories[0].category_id.id,
        categories[1].category_id.id,
        categories[2].category_id.id,
      ]),
    });
    expect(newGenres[1].toJSON()).toStrictEqual({
      ...genres[1].toJSON(),
      categories_id: expect.arrayContaining([
        categories[0].category_id.id,
        categories[1].category_id.id,
        categories[2].category_id.id,
      ]),
    });
  });

  it('should find an entity by id', async () => {
    const category = Category.fake().aCategory().build();
    categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);

    const genreFound = await genreRepo.findById(genre.genre_id);
    expect(genre.toJSON()).toStrictEqual(genreFound!.toJSON());

    await expect(genreRepo.findById(new GenreId())).resolves.toBeNull();
  });

  it('should return all genres', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const genres = await genreRepo.findAll();
    expect(genres).toHaveLength(1);
  });

  it('should throw error on update when genre not found', async () => {
    const genre = Genre.fake().aGenre().build();
    await expect(genreRepo.update(genre)).rejects.toThrow(
      new NotFoundError(genre.genre_id.id, Genre),
    );
  });

  it('should update a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].category_id)
      .build();
    await genreRepo.insert(genre);

    genre.changeName('Genre updated');
    await genreRepo.update(genre);

    let genreFound = await genreRepo.findById(genre.genre_id);
    expect(genre.toJSON()).toStrictEqual(genreFound!.toJSON());

    genre.syncCategoriesId([categories[1].category_id]);
    await genreRepo.update(genre);

    genreFound = await genreRepo.findById(genre.genre_id);
    expect(genre.toJSON()).toStrictEqual(genreFound!.toJSON());
  });

  it('should throw error on delete when a genre not found', async () => {
    const genreId = new GenreId();
    await expect(genreRepo.delete(genreId)).rejects.toThrow(
      new NotFoundError(genreId.id, Genre),
    );
  });

  it('should delete a genre', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);

    await genreRepo.delete(genre.genre_id);
    await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
  });

  // describe('search method tests', () => {
  //   it('should only apply paginate when other params are null', async () => {
  //     const created_at = new Date();
  //     const genres = Genre.fake()
  //       .theGenres(16)
  //       .withName('Movie')
  //       .withCreatedAt(created_at)
  //       .build();
  //     await repository.bulkInsert(genres);
  //     const spyToEntity = jest.spyOn(GenreModelMapper, 'toEntity');
  //     const searchOutput = await repository.search(new GenreSearchParams());
  //     expect(searchOutput).toBeInstanceOf(GenreSearchResult);
  //     expect(spyToEntity).toHaveBeenCalledTimes(15);
  //     expect(searchOutput.toJSON()).toMatchObject({
  //       total: 16,
  //       current_page: 1,
  //       last_page: 2,
  //       per_page: 15,
  //     });
  //     searchOutput.items.forEach((item) => {
  //       expect(item).toBeInstanceOf(Genre);
  //       expect(item.genre_id).toBeDefined();
  //     });
  //     const items = searchOutput.items.map((item) => item.toJSON());
  //     expect(items).toMatchObject(
  //       new Array(15).fill({
  //         name: 'Movie',
  //         description: null,
  //         is_active: true,
  //         created_at,
  //       }),
  //     );
  //   });

  //   it('should order by created_at DESC when search params are null', async () => {
  //     const created_at = new Date();
  //     const genres = Genre.fake()
  //       .theGenres(16)
  //       .withName((index) => `Movie ${index}`)
  //       .withDescription(null)
  //       .withCreatedAt((index) => new Date(created_at.getTime() + index))
  //       .build();
  //     await repository.bulkInsert(genres);
  //     const searchOutput = await repository.search(new GenreSearchParams());
  //     const items = searchOutput.items.map((item) => item.toJSON());
  //     [...items].reverse().forEach((item, index) => {
  //       expect(`${item.name}`).toBe(`${genres[index + 1].name}`);
  //     });
  //   });

  //   it('should apply paginate and filter', async () => {
  //     const genres = [
  //       Genre.fake()
  //         .aGenre()
  //         .withName('test')
  //         .withCreatedAt(new Date(new Date().getTime() + 5000))
  //         .build(),
  //       Genre.fake()
  //         .aGenre()
  //         .withName('a')
  //         .withCreatedAt(new Date(new Date().getTime() + 4000))
  //         .build(),
  //       Genre.fake()
  //         .aGenre()
  //         .withName('TEST')
  //         .withCreatedAt(new Date(new Date().getTime() + 3000))
  //         .build(),
  //       Genre.fake()
  //         .aGenre()
  //         .withName('TeSt')
  //         .withCreatedAt(new Date(new Date().getTime() + 1000))
  //         .build(),
  //     ];

  //     await repository.bulkInsert(genres);

  //     let searchOutput = await repository.search(
  //       new GenreSearchParams({
  //         page: 1,
  //         per_page: 2,
  //         filter: 'TEST',
  //       }),
  //     );

  //     expect(searchOutput.toJSON(true)).toMatchObject(
  //       new GenreSearchResult({
  //         items: [genres[0], genres[2]],
  //         total: 3,
  //         current_page: 1,
  //         per_page: 2,
  //       }).toJSON(true),
  //     );

  //     searchOutput = await repository.search(
  //       new GenreSearchParams({
  //         page: 2,
  //         per_page: 2,
  //         filter: 'TEST',
  //       }),
  //     );

  //     expect(searchOutput.toJSON(true)).toMatchObject(
  //       new GenreSearchResult({
  //         items: [genres[3]],
  //         total: 3,
  //         current_page: 2,
  //         per_page: 2,
  //       }).toJSON(true),
  //     );
  //   });

  //   it('should paginate and sort', async () => {
  //     expect(repository.sortableFields).toStrictEqual(['name', 'created_at']);

  //     const genres = [
  //       Genre.fake().aGenre().withName('b').build(),
  //       Genre.fake().aGenre().withName('a').build(),
  //       Genre.fake().aGenre().withName('d').build(),
  //       Genre.fake().aGenre().withName('e').build(),
  //       Genre.fake().aGenre().withName('c').build(),
  //     ];
  //     await repository.bulkInsert(genres);

  //     const arrange = [
  //       {
  //         params: new GenreSearchParams({
  //           page: 1,
  //           per_page: 2,
  //           sort: 'name',
  //         }),
  //         result: new GenreSearchResult({
  //           items: [genres[1], genres[0]],
  //           total: 5,
  //           current_page: 1,
  //           per_page: 2,
  //         }),
  //       },
  //       {
  //         params: new GenreSearchParams({
  //           page: 2,
  //           per_page: 2,
  //           sort: 'name',
  //         }),
  //         result: new GenreSearchResult({
  //           items: [genres[4], genres[2]],
  //           total: 5,
  //           current_page: 2,
  //           per_page: 2,
  //         }),
  //       },
  //       {
  //         params: new GenreSearchParams({
  //           page: 1,
  //           per_page: 2,
  //           sort: 'name',
  //           sort_dir: 'desc',
  //         }),
  //         result: new GenreSearchResult({
  //           items: [genres[3], genres[2]],
  //           total: 5,
  //           current_page: 1,
  //           per_page: 2,
  //         }),
  //       },
  //       {
  //         params: new GenreSearchParams({
  //           page: 2,
  //           per_page: 2,
  //           sort: 'name',
  //           sort_dir: 'desc',
  //         }),
  //         result: new GenreSearchResult({
  //           items: [genres[4], genres[0]],
  //           total: 5,
  //           current_page: 2,
  //           per_page: 2,
  //         }),
  //       },
  //     ];

  //     for (const i of arrange) {
  //       const result = await repository.search(i.params);
  //       expect(result.toJSON(true)).toMatchObject(i.result.toJSON(true));
  //     }
  //   });

  //   describe('should search using filter, sort and paginate', () => {
  //     const genres = [
  //       Genre.fake().aGenre().withName('test').build(),
  //       Genre.fake().aGenre().withName('a').build(),
  //       Genre.fake().aGenre().withName('TEST').build(),
  //       Genre.fake().aGenre().withName('e').build(),
  //       Genre.fake().aGenre().withName('TeSt').build(),
  //     ];

  //     const arrange = [
  //       {
  //         search_params: new GenreSearchParams({
  //           page: 1,
  //           per_page: 2,
  //           sort: 'name',
  //           filter: 'TEST',
  //         }),
  //         search_result: new GenreSearchResult({
  //           items: [genres[2], genres[4]],
  //           total: 3,
  //           current_page: 1,
  //           per_page: 2,
  //         }),
  //       },
  //       {
  //         search_params: new GenreSearchParams({
  //           page: 2,
  //           per_page: 2,
  //           sort: 'name',
  //           filter: 'TEST',
  //         }),
  //         search_result: new GenreSearchResult({
  //           items: [genres[0]],
  //           total: 3,
  //           current_page: 2,
  //           per_page: 2,
  //         }),
  //       },
  //     ];

  //     beforeEach(async () => {
  //       await repository.bulkInsert(genres);
  //     });

  //     test.each(arrange)(
  //       'when value is $search_params',
  //       async ({ search_params, search_result }) => {
  //         const result = await repository.search(search_params);
  //         expect(result.toJSON(true)).toMatchObject(search_result.toJSON(true));
  //       },
  //     );
  //   });
  // });
  describe('transaction mode', () => {
    describe('insert method', () => {
      it('should insert a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        await uow.commit();

        const result = await genreRepo.findById(genre.genre_id);
        expect(genre.genre_id).toBeValueObject(result!.genre_id);
      });

      it('should rollback the insertion', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        await uow.rollback();

        await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
      });
    });

    describe('bulkInsert method', () => {
      it('should insert a genres', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        await uow.commit();

        const [genre1, genre2] = await Promise.all([
          genreRepo.findById(genres[0].genre_id),
          genreRepo.findById(genres[1].genre_id),
        ]);
        expect(genre1!.genre_id).toBeValueObject(genres[0]!.genre_id);
        expect(genre2!.genre_id).toBeValueObject(genres[1]!.genre_id);
      });

      it('should rollback the bulk insertion', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        await uow.rollback();

        await expect(
          genreRepo.findById(genres[0].genre_id),
        ).resolves.toBeNull();
      });
    });

    describe('update method', () => {
      it('should update a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        genre.changeName('new name');
        await genreRepo.update(genre);
        await uow.commit();

        const result = await genreRepo.findById(genre.genre_id);
        expect(result!.name).toBe(genre.name);
      });

      it('should rollback the update', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        genre.changeName('new name');
        await genreRepo.update(genre);
        await uow.rollback();

        const notChangedGenre = await genreRepo.findById(genre.genre_id);
        expect(notChangedGenre!.name).not.toBe(genre.name);
      });
    });

    describe('delete method', () => {
      it('should delete a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        await genreRepo.delete(genre.genre_id);
        await uow.commit();

        await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
      });

      it('should rollback the deletion', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        await uow.start();
        await genreRepo.delete(genre.genre_id);
        await uow.rollback();

        const result = await genreRepo.findById(genre.genre_id);
        expect(result!.genre_id).toBeValueObject(genre.genre_id);
      });
    });

    describe('findById method', () => {
      it('should return a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.insert(genre);
        const result = await genreRepo.findById(genre.genre_id);
        expect(result!.genre_id).toBeValueObject(genre.genre_id);
        await uow.commit();
      });
    });

    describe('findAll method', () => {
      it('should return a genre', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(category.category_id)
          .build();

        await uow.start();
        await genreRepo.bulkInsert(genres);
        const result = await genreRepo.findAll();
        expect(result.length).toBe(2);
        await uow.commit();
      });
    });
  });
});
