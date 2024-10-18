import { literal, Op } from 'sequelize';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import {
  SearchParams,
  SortDirection,
} from '../../../../shared/domain/repository/search-params';
import { Category, CategoryId } from '../../../domain/category.aggregate';
import {
  CategoryFilter,
  CategorySearchResult,
  ICategoryRepository,
} from '../../../domain/category.repository';
import { CategoryModel } from './category.model';
import { CategoryModelMapper } from './category-model-mapper';
import { InvalidArgumentError } from 'src/core/shared/domain/errors/invalid-argument.error';

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`),
    },
  };

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    const modelProps = CategoryModelMapper.toModel(entity);
    await this.categoryModel.create(modelProps.toJSON());
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    const modelsProps = entities.map((entity) =>
      CategoryModelMapper.toModel(entity).toJSON(),
    );
    await this.categoryModel.bulkCreate(modelsProps);
  }

  async update(entity: Category): Promise<void> {
    const id = entity.category_id.id;
    const model = await this._get(id);
    if (!model) {
      throw new NotFoundError(id, this.getEntity());
    }
    const modelProps = CategoryModelMapper.toModel(entity);
    await this.categoryModel.update(modelProps.toJSON(), {
      where: { category_id: id },
    });
  }

  async delete(category_id: CategoryId): Promise<void> {
    const id = category_id.id;
    const model = await this._get(id);
    if (!model) {
      throw new NotFoundError(id, this.getEntity());
    }
    await this.categoryModel.destroy({ where: { category_id: id } });
  }

  async findById(entity_id: CategoryId): Promise<Category | null> {
    const model = await this._get(entity_id.id);
    return model ? CategoryModelMapper.toEntity(model) : null;
  }

  private async _get(id: string) {
    return await this.categoryModel.findByPk(id);
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();
    return models.map((model) => {
      return CategoryModelMapper.toEntity(model);
    });
  }

  async findByIds(ids: CategoryId[]): Promise<Category[]> {
    const models = await this.categoryModel.findAll({
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    return models.map((m) => CategoryModelMapper.toEntity(m));
  }

  async search(
    props: SearchParams<CategoryFilter>,
  ): Promise<CategorySearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;
    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(props.filter && {
        where: {
          name: { [Op.like]: `%${props.filter}%` },
        },
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sort_dir!) }
        : { order: [['created_at', 'desc']] }),
      limit,
      offset,
    });
    return new CategorySearchResult({
      items: models.map((model) => {
        return CategoryModelMapper.toEntity(model);
      }),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  async existsById(
    ids: CategoryId[],
  ): Promise<{ exists: CategoryId[]; not_exists: CategoryId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsCategoryModels = await this.categoryModel.findAll({
      attributes: ['category_id'],
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    const existsCategoryIds = existsCategoryModels.map(
      (m) => new CategoryId(m.category_id),
    );
    const notExistsCategoryIds = ids.filter(
      (id) => !existsCategoryIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsCategoryIds,
      not_exists: notExistsCategoryIds,
    };
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.categoryModel.sequelize!.getDialect() as 'mysql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
