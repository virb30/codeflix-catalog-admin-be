import { Transform } from 'class-transformer';
import { CreateCategoryOutput } from '../../core/category/application/use-cases/create-category/create-category.use-case';
import { ListCategoriesOutput } from '../../core/category/application/use-cases/list-categories/list-categories.use-case';
import { CollectionPresenter } from '../shared-module/collection.presenter';

export class CategoryPresenter {
  id: string;
  name: string;
  description: string | null;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: CreateCategoryOutput) {
    this.id = output.id;
    this.name = output.name;
    this.description = output.name;
    this.created_at = output.created_at;
  }
}

export class CategoryCollectionPresenter extends CollectionPresenter {
  data: CategoryPresenter[];

  constructor(output: ListCategoriesOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new CategoryPresenter(item));
  }
}