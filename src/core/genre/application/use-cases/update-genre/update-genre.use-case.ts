import { IUnitOfWork } from 'src/core/shared/domain/repository/unit-of-work.interface';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { EntityValidationError } from '../../../../shared/domain/validators/validation.error';
import { Genre, GenreId } from '../../../domain/genre.aggregate';
import { IGenreRepository } from '../../../domain/genre.repository';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output';
import { UpdateGenreInput } from './update-genre.input';
import { ICategoryRepository } from 'src/core/category/domain/category.repository';
import { CategoriesIdExistsInStorageValidator } from 'src/core/category/application/validations/categories-id-exists-in-storage.validator';

export class UpdateGenreUseCase
  implements IUseCase<UpdateGenreInput, UpdateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
    private categoriesIdExistsInStorageValidator: CategoriesIdExistsInStorageValidator,
  ) {}

  async execute(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
    const uuid = new GenreId(input.id);
    const genre = await this.genreRepo.findById(uuid);

    if (!genre) {
      throw new NotFoundError(input.id, Genre);
    }

    if (input.name) {
      genre.changeName(input.name);
    }

    if (input.is_active === true) {
      genre.activate();
    }

    if (input.is_active === false) {
      genre.deactivate();
    }

    const notification = genre.notification;

    if (input.categories_id) {
      const [categoriesId, errorsCategoriesId] = (
        await this.categoriesIdExistsInStorageValidator.validate(
          input.categories_id,
        )
      ).asArray();

      if (categoriesId) {
        genre.syncCategoriesId(categoriesId);
      }

      if (errorsCategoriesId) {
        notification.setError(
          errorsCategoriesId.map((e) => e.message),
          'categories_id',
        );
      }
    }

    if (genre.notification.hasErrors()) {
      throw new EntityValidationError(genre.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.genreRepo.update(genre);
    });

    const categories = await this.categoryRepo.findByIds(
      Array.from(genre.categories_id.values()),
    );

    return GenreOutputMapper.toOutput(genre, categories);
  }
}

export type UpdateGenreOutput = GenreOutput;
