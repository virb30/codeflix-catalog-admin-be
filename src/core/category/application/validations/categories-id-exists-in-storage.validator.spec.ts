import { CategoryInMemoryRepository } from '../../infra/db/in-memory/category-in-memory.repository';
import { Category, CategoryId } from '../../domain/category.aggregate';
import { NotFoundError } from 'src/core/shared/domain/errors/not-found.error';
import { CategoriesIdExistsInStorageValidator } from './categories-id-exists-in-storage.validator';

describe('CategoriesIdExistsInStorageValidator Unit Tests', () => {
  let categoryRepo: CategoryInMemoryRepository;
  let validator: CategoriesIdExistsInStorageValidator;

  beforeEach(() => {
    categoryRepo = new CategoryInMemoryRepository();
    validator = new CategoriesIdExistsInStorageValidator(categoryRepo);
  });

  it('should return many not found error when categories id not exists in storage', async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const spyExistsById = jest.spyOn(categoryRepo, 'existsById');
    let [categoriesId, errorsCategoriesId] = await validator.validate([
      categoryId1.id,
      categoryId2.id,
    ]);
    expect(categoriesId).toStrictEqual(null);
    expect(errorsCategoriesId).toStrictEqual([
      new NotFoundError(categoryId1.id, Category),
      new NotFoundError(categoryId2.id, Category),
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const category1 = Category.fake().aCategory().build();
    await categoryRepo.insert(category1);
    [categoriesId, errorsCategoriesId] = await validator.validate([
      category1.category_id.id,
      categoryId2.id,
    ]);
    expect(categoriesId).toStrictEqual(null);
    expect(errorsCategoriesId).toStrictEqual([
      new NotFoundError(categoryId2.id, Category),
    ]);
    expect(spyExistsById).toHaveBeenCalledTimes(2);
  });

  it('should return a list of categories id', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    await categoryRepo.bulkInsert([category1, category2]);
    const [categoriesId, errorsCategoriesId] = await validator.validate([
      category1.category_id.id,
      category2.category_id.id,
    ]);
    expect(categoriesId).toHaveLength(2);
    expect(errorsCategoriesId).toStrictEqual(null);
    expect(categoriesId[0]).toBeValueObject(category1.category_id);
    expect(categoriesId[1]).toBeValueObject(category2.category_id);
  });
});
