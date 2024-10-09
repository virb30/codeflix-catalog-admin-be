import { Genre, GenreId } from '../../../domain/genre.aggregate';
import {
  GenreSearchParams,
  GenreSearchResult,
  IGenreRepository,
} from '../../../domain/genre.repository';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { GenreModel } from './genre-model';
import { GenreModelMapper } from './genre-model-mapper';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { UnitOfWorkSequelize } from 'src/core/shared/infra/db/sequelize/unit-of-work-sequelize';

export class GenreSequelizeRepository implements IGenreRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) =>
        `binary ${this.genreModel.name}.name ${sort_dir}`,
    },
  };

  constructor(
    private genreModel: typeof GenreModel,
    private uow: UnitOfWorkSequelize,
  ) {}

  async insert(entity: Genre): Promise<void> {
    await this.genreModel.create(GenreModelMapper.toModelProps(entity), {
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
  }

  async bulkInsert(entities: Genre[]): Promise<void> {
    const models = entities.map((e) => GenreModelMapper.toModelProps(e));
    await this.genreModel.bulkCreate(models, {
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
  }

  async findById(id: GenreId): Promise<Genre | null> {
    const model = await this._get(id.id);
    return model ? GenreModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => GenreModelMapper.toEntity(m));
  }

  async update(aggregate: Genre): Promise<void> {
    const model = await this._get(aggregate.genre_id.id);

    if (!model) {
      throw new NotFoundError(aggregate.genre_id.id, this.getEntity());
    }

    await model.$remove(
      'categories',
      model.categories_id.map((c) => c.category_id),
      {
        transaction: this.uow.getTransaction(),
      },
    );
    const { categories_id, ...props } =
      GenreModelMapper.toModelProps(aggregate);
    await this.genreModel.update(props, {
      where: { genre_id: aggregate.genre_id.id },
      transaction: this.uow.getTransaction(),
    });
    await model.$add(
      'categories',
      categories_id.map((c) => c.category_id),
      {
        transaction: this.uow.getTransaction(),
      },
    );
  }

  async delete(id: GenreId): Promise<void> {
    const genreCategoryRelation =
      this.genreModel.associations.categories_id.target;
    await genreCategoryRelation.destroy({
      where: { genre_id: id.id },
      transaction: this.uow.getTransaction(),
    });
    const affectedRows = await this.genreModel.destroy({
      where: { genre_id: id.id },
      transaction: this.uow.getTransaction(),
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id.id, this.getEntity());
    }
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }

  search(props: GenreSearchParams): Promise<GenreSearchResult> {
    throw new Error('Method not implemented.');
  }

  private async _get(id: string): Promise<GenreModel | null> {
    return this.genreModel.findByPk(id, {
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
  }
}
