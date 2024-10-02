import { CategoryId } from '../../../category/domain/category.aggregate';
import { Genre, GenreId } from '../genre.aggregate';

describe('Genre Unit Tests', () => {
  beforeEach(() => {
    Genre.prototype.validate = jest
      .fn()
      .mockImplementation(Genre.prototype.validate);
  });

  describe('constructor', () => {
    test('should create a genre with default values', () => {
      const category_id = new CategoryId();
      const categories_id = new Map([[category_id.id, category_id]]);
      const genre = new Genre({
        name: 'Action',
        categories_id,
      });

      expect(genre.genre_id).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('Action');
      expect(genre.categories_id).toBe(categories_id);
      expect(genre.is_active).toBeTruthy();
      expect(genre.created_at).toBeInstanceOf(Date);
    });

    test('should create a genre with all values', () => {
      const category_id = new CategoryId();
      const categories_id = new Map([[category_id.id, category_id]]);
      const created_at = new Date();
      const genre = new Genre({
        name: 'Action',
        categories_id,
        is_active: false,
        created_at,
      });

      expect(genre.genre_id).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('Action');
      expect(genre.categories_id).toBe(categories_id);
      expect(genre.is_active).toBeFalsy();
      expect(genre.created_at).toBe(created_at);
    });
  });

  describe('create command', () => {
    test('should create a Genre', () => {
      const category_id = new CategoryId();
      const categories_id = [category_id];
      const genre = Genre.create({
        name: 'Action',
        categories_id,
      });
      expect(genre.genre_id).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('Action');
      expect(genre.categories_id).toEqual(
        new Map([[category_id.id, category_id]]),
      );
      expect(genre.is_active).toBeTruthy();
      expect(genre.created_at).toBeInstanceOf(Date);
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
      expect(genre.notification.hasErrors()).toBe(false);
    });

    test('should create a genre with is_active', () => {
      const category_id = new CategoryId();
      const categories_id = [category_id];
      const genre = Genre.create({
        name: 'Action',
        is_active: false,
        categories_id,
      });
      expect(genre.genre_id).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('Action');
      expect(genre.categories_id).toEqual(
        new Map([[category_id.id, category_id]]),
      );
      expect(genre.is_active).toBeFalsy();
      expect(genre.created_at).toBeInstanceOf(Date);
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
      expect(genre.notification.hasErrors()).toBe(false);
    });
  });

  describe('genre_id field', () => {
    const arrange = [
      { genre_id: null },
      { genre_id: undefined },
      { genre_id: new GenreId() },
    ];

    test.each(arrange)('id = %j', ({ genre_id }) => {
      const category_id = new CategoryId();
      const categories_id = new Map([[category_id.id, category_id]]);
      const genre = new Genre({
        name: 'Movie',
        genre_id: genre_id as any,
        categories_id,
      });
      expect(genre.genre_id).toBeInstanceOf(GenreId);
      if (genre_id) {
        expect(genre.genre_id).toEqual(genre_id);
      }
    });
  });

  test('should change name', () => {
    const category_id = new CategoryId();
    const categories_id = new Map([[category_id.id, category_id]]);
    const genre = new Genre({
      name: 'Action',
      categories_id,
    });
    genre.changeName('other name');
    expect(genre.name).toBe('other name');
    expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
    expect(genre.notification.hasErrors()).toBe(false);
  });

  test('should add categoryId', () => {
    const category_id = new CategoryId();
    const categories_id = [category_id];
    const genre = Genre.create({
      name: 'Action',
      categories_id,
    });
    expect(genre.categories_id.size).toBe(1);
    genre.addCategoryId(new CategoryId());
    expect(genre.categories_id.size).toBe(2);
    expect(genre.notification.hasErrors()).toBe(false);
  });

  test('should remove categoryId', () => {
    const categoryIdToRemove = new CategoryId();
    const category_id = new CategoryId();
    const categories_id = [category_id, categoryIdToRemove];
    const genre = Genre.create({
      name: 'Action',
      categories_id,
    });
    expect(genre.categories_id.size).toBe(2);
    genre.removeCategoryId(categoryIdToRemove);
    expect(genre.categories_id.size).toBe(1);
    expect(genre.categories_id.get(categoryIdToRemove.id)).toBeUndefined();
    expect(genre.categories_id.get(category_id.id)).toBe(category_id);
    expect(genre.notification.hasErrors()).toBe(false);
  });

  test('should sync categories_id', () => {
    const oldCategories = [new CategoryId(), new CategoryId()];
    const newCategories = [new CategoryId()];
    const genre = Genre.create({
      name: 'Action',
      categories_id: oldCategories,
    });
    expect(genre.categories_id.size).toBe(2);
    expect(genre.categories_id).toEqual(
      new Map(
        oldCategories.map((category_id) => [category_id.id, category_id]),
      ),
    );
    genre.syncCategoriesId(newCategories);
    expect(genre.categories_id.size).toBe(1);
    expect(genre.categories_id).toEqual(
      new Map(
        newCategories.map((category_id) => [category_id.id, category_id]),
      ),
    );
  });

  test('should activate a genre', () => {
    const category_id = new CategoryId();
    const categories_id = new Map([[category_id.id, category_id]]);
    const genre = new Genre({
      name: 'Action',
      is_active: false,
      categories_id,
    });
    genre.activate();
    expect(genre.is_active).toBeTruthy();
    expect(genre.notification.hasErrors()).toBe(false);
  });

  test('should deactivate a genre', () => {
    const category_id = new CategoryId();
    const categories_id = new Map([[category_id.id, category_id]]);
    const genre = new Genre({
      name: 'Action',
      categories_id,
    });
    genre.deactivate();
    expect(genre.is_active).toBeFalsy();
    expect(genre.notification.hasErrors()).toBe(false);
  });
});

describe('Genre Validator', () => {
  describe('create command', () => {
    test('should an invalid genre with name property', () => {
      const categories_id = [new CategoryId()];
      const category = Genre.create({ name: 't'.repeat(256), categories_id });
      expect(category.notification.hasErrors()).toBe(true);
      expect(category.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('changeName method', () => {
    test('should an invalid category with name property', () => {
      const categories_id = [new CategoryId()];
      const category = Genre.create({ name: 'a', categories_id });
      category.changeName('t'.repeat(256));
      expect(category.notification.hasErrors()).toBe(true);
      expect(category.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
});
