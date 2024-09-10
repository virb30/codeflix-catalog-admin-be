import { Transform } from 'class-transformer';
import { CreateCategoryOutput } from 'src/core/category/application/use-cases/create-category/create-category.use-case';

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
